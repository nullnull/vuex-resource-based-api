import { Resource } from "../index";
import { createActionName, last } from '../util'
import pluralize from 'pluralize'
type Context = any // TODO

const defaultQueryHandler = (resourceWithNamespace: string, action: string, context: Context): Object => {
  const { route, query } = context
  const pathSplited = route.path.split('/')
  const queryAndParam = {
    ...query,
    ...route.params
  }
  const resource = last(resourceWithNamespace.split('/'))

  if (action === 'index') {
    const resourceFromPath = pathSplited[pathSplited.length - 1]
    if (resourceFromPath === pluralize(resource)) {
      return queryAndParam
    } else {
      return {}
    }
  } else {
    const resourceFromPath = pathSplited[pathSplited.length - 2]
    if (queryAndParam[`${resource}Id`]) {
      return {
        id: queryAndParam[`${resource}Id`]
      }
    } else if (queryAndParam.id && resourceFromPath === pluralize(resource)) {
      return {
        id: queryAndParam.id
      }
    } else {
      return {}
    }
  }
}

async function fetchResource(
  resourceWithNamespace: string,
  action: string,
  context: Context,
  createHeaders: Function,
  errorHandler: Function,
  queryHandler: typeof defaultQueryHandler
) {
  const { store } = context
  const headers = createHeaders ? createHeaders(context) : {}

  try {
    if (['index', 'new', 'show', 'edit'].includes(action)) {
      await store.dispatch(`${resourceWithNamespace}/${createActionName(resourceWithNamespace, action)}`, {
        headers,
        query: queryHandler(resourceWithNamespace, action, context)
      })
    }
  } catch (e) {
    errorHandler(e, context)
  }
}

const generateFetch = (
  resources: Resource[],
  {
    createHeaders = (ctx: Context): object => { return {} },
    errorHandler = (e: any, ctx: Context): void => { throw e },
    queryHandler = defaultQueryHandler
  } = {}
): (ctx: Context) => void => {
  return async (context: Context) => {
    for (var i = 0; i < resources.length; i++) {
      const r = resources[i]
      await fetchResource(r.resource, r.action, context, createHeaders, errorHandler, queryHandler)
    }
  }
}

export default generateFetch