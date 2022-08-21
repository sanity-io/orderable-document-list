import {orderRankOrdering} from './../fields/orderRankOrdering'
import {orderRankField} from './../fields/orderRankField'

type orderMethodOptions = 'overwrite' | 'prepend' | 'append'
type TypeConfig = string | [string, orderMethodOptions]

const DEFAULT_ORDER_METHOD: orderMethodOptions = 'overwrite'
/* Helper function to simplify the creation of ordered document schema types
* example: 
        {
            ...sanityConfig,
            schema: {
                types: mapToSchemaTypes(schemaTypes, ['category'])
            }
        }
*/
export const mapToSchemaTypes = (schemaTypes: Array<any>, typeConfigs: TypeConfig[]) => (
  previousTypes: Array<any> = [],
  context: any
) => {
  // ensure all args are arrays, apply default order method if only category name supplied
  const _typeConfigs = typeConfigs.map(t => (typeof t == 'string' ? [t, DEFAULT_ORDER_METHOD] : t))
  return [
    ...previousTypes,
    ...schemaTypes.map(docType => {
      const typeToAlter = _typeConfigs.find(([name]) => docType.name == name)
      if (typeToAlter) {
        return {
          ...docType,
          orderings: getRankOrdering(docType.Orderings, typeToAlter[1] as orderMethodOptions),
          fields: [...docType.fields, orderRankField({type: docType.name, context})]
        }
      }
      return docType
    })
  ]
}
const getRankOrdering = (previousOrderings: [], orderingMethod: orderMethodOptions) => {
  switch (orderingMethod) {
    case 'overwrite':
      return [orderRankOrdering]
    case 'prepend':
      return [orderRankOrdering, ...previousOrderings]
    case 'append':
      return [...previousOrderings, orderRankOrdering]
    default:
      return previousOrderings
  }
}
