import React from 'react'
import Cell from './Cell'
import Checkbox from '../Checkbox'

class Table extends React.Component {
  constructor(props) {
    super(props)

    this.renderRow = this.renderRow.bind(this)
    this.renderHeader = this.renderHeader.bind(this)
  }

  renderHeader (_cell, cellIndex) {
    const {headers} = this.props
    return (<Cell key={`heading-${cellIndex}`} header={true}>{headers[_cell]}</Cell>)
  };

  renderRow (_row, rowIndex) {
    const {data, headers, massiveSelection, selected} = this.props
    let list = []
    if (massiveSelection) {
      list = selected.split(',')
    }

    return (
      <tr key={`row-${rowIndex}`}>
        {
          massiveSelection &&
          <Cell key="massive-selection" width={20}>
            <Checkbox
              className="checkbox checkbox-gray"
              selected={list.includes(data[rowIndex]['id'].toString()) || selected == 'all'}
              name="massive-selection"
              option={{ id: rowIndex, label: '' }}
              onChange={(target) => { this.props.onMassSelect(data[rowIndex]['id'], target.checked) }}
            />
          </Cell>
        }
        {Object.keys(headers).map((property, cellIndex) => {
          return ( <Cell className={`clickable ${property}`} key={`${rowIndex}-${cellIndex}`} onClick={() => this.props.onRowClick(_row.id)}><span>{data[rowIndex][property]}</span></Cell> )
        })}
      </tr>
    )
  };

  render () {
    const { classes, headers, data, massiveSelection, selected, hasSelection } = this.props

    const theadMarkup = (
      <tr key="heading">
        {
          massiveSelection &&
          <Cell key="massive-selection" width={20}>
            <Checkbox
              className="checkbox checkbox-gray"
              selected={selected == 'all'}
              name="massive-selection"
              option={{ id: 'all', label: '' }}
              onChange={(target) => { this.props.onMassSelect('all', target.checked) }}
            />
          </Cell>
        }
        {
          hasSelection &&
          this.props.optionsRender()
        }

        {
          !hasSelection &&
          Object.keys(headers).map(this.renderHeader)
        }
      </tr>
    )
    const tbodyMarkup = data.map(this.renderRow)

    return (
      <div className="table-responsive">
        <table className={`table table-striped table-hover ${classes}`}>
          <thead>{theadMarkup}</thead>
          <tbody>{tbodyMarkup}</tbody>
        </table>
      </div>
    )
  }
}

export default Table
