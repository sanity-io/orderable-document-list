import PropTypes from 'prop-types'
import React, {Component} from 'react'

import DocumentListWrapper from './DocumentListWrapper'
import {resetOrder} from './helpers/resetOrder'

// Must use a Class Component here so the actionHandlers can be called
export default class OrderableDocumentList extends Component {
  static propTypes = {
    options: PropTypes.shape({
      type: PropTypes.string,
      filter: PropTypes.string,
      params: PropTypes.object,
    }).isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      showIncrements: false,
      resetOrderTransaction: {},
    }
  }

  actionHandlers = {
    showIncrements: () => {
      this.setState((state) => ({
        showIncrements: !state.showIncrements,
      }))
    },

    resetOrder: async () => {
      this.setState(() => ({
        resetOrderTransaction: {
          status: `info`,
          title: `Reordering started...`,
          closable: true,
        },
      }))

      const update = await resetOrder(this.props.options.type)

      const reorderWasSuccessful = update?.results?.length

      this.setState(() => ({
        resetOrderTransaction: {
          status: reorderWasSuccessful ? `success` : `info`,
          title: reorderWasSuccessful
            ? `Reordered ${update.results.length === 1 ? `Document` : `Documents`}`
            : `Reordering failed`,
          closable: true,
        },
      }))
    },
  }

  render() {
    return (
      <DocumentListWrapper
        type={this?.props?.options?.type}
        filter={this?.props?.options?.filter}
        params={this?.props?.options?.params}
        showIncrements={this.state.showIncrements}
        resetOrderTransaction={this.state.resetOrderTransaction}
      />
    )
  }
}
