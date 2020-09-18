import React from 'react'
import CheckBoxesIcon from './CheckBoxesIcon'
import CheckBoxIcon from './CheckBoxIcon'
import DatePickerIcon from './DatePickerIcon'
import DropDownIcon from './DropDownIcon'
import LocationIcon from './LocationIcon'
import TextNumberIcon from './TextNumberIcon'
import RadioButtonIcon from './RadioButtonIcon'
import SignatureIcon from './SignatureIcon'
import SingleTextIcon from './SingleTextIcon'
import TextAreaIcon from './TextAreaIcon'
import PasswordIcon from './PasswordIcon'
import CalculationIcon from './CalculationIcon'
import TicketIcon from './TicketIcon'

class IconRenderer extends React.Component {
  render() {
    const {
      type
    } = this.props

    return (
      <div>
        {
          (
            type == 'text_field' ||
            type == 'text_email'
          ) &&
          <SingleTextIcon />
        }

        {
          type == 'text_password' &&
          <PasswordIcon />
        }

        {
          (type == 'text_number' || type == 'text_tel') &&
          <TextNumberIcon />
        }

        {
          (type == 'text_area' || type == 'info') &&
          <TextAreaIcon />
        }

        {
          type == 'multiple_select' &&
          <CheckBoxesIcon />
        }

        {
          type == 'radio' &&
          <RadioButtonIcon />
        }

        {
          type == 'date' &&
          <DatePickerIcon />
        }

        {
          type == 'signature' &&
          <SignatureIcon />
        }

        {
          type == 'location' &&
          <LocationIcon />
        }

        {
          type == 'dropdown' &&
          <DropDownIcon />
        }

        {
          type == 'calculation' &&
          <CalculationIcon />
        }

        {
          type == 'ticket_id' &&
          <TicketIcon />
        }
      </div>
    )
  }
}

export default IconRenderer

