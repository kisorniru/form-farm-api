import React from 'react'
import TemplateCustomers from './customers'
import TemplateGroups from './groups'

class TemplateAccess extends React.Component {
  render() {
    return (
      <div className="col-md-8">
        <TemplateCustomers />
        <TemplateGroups />
      </div>
    )
  }
}

export default TemplateAccess
