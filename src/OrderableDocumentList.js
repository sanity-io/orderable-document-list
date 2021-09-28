import PropTypes from 'prop-types'
import React, {Component} from 'react'

import DocumentListWrapper from './DocumentListWrapper'
import {resetOrder} from './helpers/resetOrder'

// Must use a Class Component here so the actionHandlers can be called
export default class OrderableDocumentList extends Component {
  static propTypes = {
    options: PropTypes.shape({
      type: PropTypes.string,
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

      this.setState(() => ({
        resetOrderTransaction: {
          status: `success`,
          title: `Reordered ${update.results.length} Documents`,
          closable: true,
        },
      }))
    },
  }

  render() {
    return (
      <DocumentListWrapper
        type={this?.props?.options?.type}
        showIncrements={this.state.showIncrements}
        resetOrderTransaction={this.state.resetOrderTransaction}
      />
    )
  }
}
