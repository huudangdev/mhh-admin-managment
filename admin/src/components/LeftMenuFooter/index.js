/**
 *
 * LeftMenuFooter
 *
 */

import React from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import { PropTypes } from 'prop-types'
import Wrapper from './Wrapper'

import messages from './messages.json'

defineMessages(messages)

function LeftMenuFooter ({ version, ...rest }) {
  return (
    <Wrapper>
      <div className='poweredBy'>
        <FormattedMessage {...messages.poweredBy} key='poweredBy' />
        huudang.tech&nbsp;v{version}
      </div>
    </Wrapper>
  )
}

LeftMenuFooter.propTypes = {
  version: PropTypes.string.isRequired
}

export default LeftMenuFooter
