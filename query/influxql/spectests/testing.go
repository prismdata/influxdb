package spectests

import (
	"context"
	"path/filepath"
	"runtime"
	"testing"
	"time"

	"github.com/andreyvit/diff"
	"github.com/influxdata/flux/ast"
	"github.com/influxdata/flux/parser"
	platform "github.com/influxdata/influxdb"
	"github.com/influxdata/influxdb/mock"
	"github.com/influxdata/influxdb/query/influxql"
	platformtesting "github.com/influxdata/influxdb/testing"
)

var dbrpMappingSvc = mock.NewDBRPMappingService()
var organizationID platform.ID
var bucketID platform.ID
var altBucketID platform.ID

func init() {
	mapping := platform.DBRPMapping{
		Cluster:         "cluster",
		Database:        "db0",
		RetentionPolicy: "autogen",
		Default:         true,
		OrganizationID:  organizationID,
		BucketID:        bucketID,
	}
	altMapping := platform.DBRPMapping{
		Cluster:         "cluster",
		Database:        "db0",
		RetentionPolicy: "autogen",
		Default:         true,
		OrganizationID:  organizationID,
		BucketID:        altBucketID,
	}
	dbrpMappingSvc.FindByFn = func(ctx context.Context, cluster string, db string, rp string) (*platform.DBRPMapping, error) {
		if rp == "alternate" {
			return &altMapping, nil
		}
		return &mapping, nil
	}
	dbrpMappingSvc.FindFn = func(ctx context.Context, filter platform.DBRPMappingFilter) (*platform.DBRPMapping, error) {
		if filter.RetentionPolicy != nil && *filter.RetentionPolicy == "alternate" {
			return &altMapping, nil
		}
		return &mapping, nil
	}
	dbrpMappingSvc.FindManyFn = func(ctx context.Context, filter platform.DBRPMappingFilter, opt ...platform.FindOptions) ([]*platform.DBRPMapping, int, error) {
		m := &mapping
		if filter.RetentionPolicy != nil && *filter.RetentionPolicy == "alternate" {
			m = &altMapping
		}
		return []*platform.DBRPMapping{m}, 1, nil
	}
}

// Fixture is a structure that will run tests.
type Fixture interface {
	Run(t *testing.T)
}

type fixture struct {
	stmt string
	want string

	file string
	line int
}

func NewFixture(stmt, want string) Fixture {
	_, file, line, _ := runtime.Caller(1)
	return &fixture{
		stmt: stmt,
		want: want,
		file: filepath.Base(file),
		line: line,
	}
}

func (f *fixture) Run(t *testing.T) {
	organizationID = platformtesting.MustIDBase16("aaaaaaaaaaaaaaaa")
	bucketID = platformtesting.MustIDBase16("bbbbbbbbbbbbbbbb")
	altBucketID = platformtesting.MustIDBase16("cccccccccccccccc")

	t.Run(f.stmt, func(t *testing.T) {
		wantAST := parser.ParseSource(f.want)
		if ast.Check(wantAST) > 0 {
			err := ast.GetError(wantAST)
			t.Fatalf("found parser errors in the want text: %s", err.Error())
		}
		want := ast.Format(wantAST)

		transpiler := influxql.NewTranspilerWithConfig(
			dbrpMappingSvc,
			influxql.Config{
				DefaultDatabase: "db0",
				Cluster:         "cluster",
				Now:             Now(),
			},
		)
		pkg, err := transpiler.Transpile(context.Background(), f.stmt)
		if err != nil {
			t.Fatalf("%s:%d: unexpected error: %s", f.file, f.line, err)
		}
		got := ast.Format(pkg)

		// Encode both of these to JSON and compare the results.
		if want != got {
			out := diff.LineDiff(want, got)
			t.Fatalf("unexpected ast at %s:%d\n%s", f.file, f.line, out)
		}
	})
}

type collection struct {
	stmts []string
	wants []string

	file string
	line int
}

func (c *collection) Add(stmt, want string) {
	c.stmts = append(c.stmts, stmt)
	c.wants = append(c.wants, want)
}

func (c *collection) Run(t *testing.T) {
	for i, stmt := range c.stmts {
		f := fixture{
			stmt: stmt,
			want: c.wants[i],
			file: c.file,
			line: c.line,
		}
		f.Run(t)
	}
}

var allFixtures []Fixture

func RegisterFixture(fixtures ...Fixture) {
	allFixtures = append(allFixtures, fixtures...)
}

func All() []Fixture {
	return allFixtures
}

func Now() time.Time {
	t, err := time.Parse(time.RFC3339, "2010-09-15T09:00:00Z")
	if err != nil {
		panic(err)
	}
	return t
}
