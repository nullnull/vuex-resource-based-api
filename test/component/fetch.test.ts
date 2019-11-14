import Napi from './../../src/index'
import { Resource } from '../../dist';

const mockContext = () => {
  return {
    store: {
      dispatch: jest.fn((actionName, payload) => { return {} })
    },
    route: {
      params: {}
    },
    query: {},
  }
}

const payload = {
  headers: {},
  params: {},
  query: {},
};

describe('generateFetch', () => {
  test('it dispatches fetch actions', async () => {
    const resources = [
      { resource: 'article', action: 'index' },
      { resource: 'article', action: 'show' },
      { resource: 'article', action: 'new' },
      { resource: 'article', action: 'edit' },
      { resource: 'article', action: 'destroy' },
    ] as Resource[]

    const fetch = Napi.generateFetch(resources)

    const ctx = mockContext()
    await fetch(ctx)
    expect(ctx.store.dispatch).toHaveBeenCalledWith("article/fetchArticles", payload)
    expect(ctx.store.dispatch).toHaveBeenCalledWith("article/fetchArticle", payload)
    expect(ctx.store.dispatch).toHaveBeenCalledWith("article/initializeArticle", payload)
  });

  describe('with resources with namespace', () => {
    test('it dispatches fetch actions with url with namespace', async () => {
      const resources = [
        { resource: 'admin/article', action: 'index' },
        { resource: 'admin/article', action: 'show' },
        { resource: 'admin/article', action: 'new' },
      ] as Resource[]

      const fetch = Napi.generateFetch(resources)

      const ctx = mockContext()
      await fetch(ctx)
      expect(ctx.store.dispatch).toHaveBeenCalledWith("admin/article/fetchArticles", payload)
      expect(ctx.store.dispatch).toHaveBeenCalledWith("admin/article/fetchArticle", payload)
      expect(ctx.store.dispatch).toHaveBeenCalledWith("admin/article/initializeArticle", payload)
    });
  })

  describe("with query and params", () => {
    test("it dispatches fetch actions with query and params", async () => {
      const resources = [
        { resource: "admin/article", action: "index" },
      ] as Resource[];

      const fetch = Napi.generateFetch(resources);

      const ctx = {
        store: {
          dispatch: jest.fn((actionName, payload) => {
            return {};
          })
        },
        route: {
          params: {
            foo: 1,
          }
        },
        query: {
          bar: 1
        }
      };
      await fetch(ctx);
      expect(ctx.store.dispatch).toHaveBeenCalledWith(
        "admin/article/fetchArticles",
        {
          headers: {},
          params: { foo: 1 },
          query: { bar: 1 }
        }
      );
    });
  });
});
