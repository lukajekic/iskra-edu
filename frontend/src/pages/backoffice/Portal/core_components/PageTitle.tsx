import { Text } from '@mantine/core'
import React from 'react'

const PageTitle = ({text}: {text:string}) => {
  return (
    <div className="border-b-1 pb-2 mb-3">
        <Text size='24px' fw={700}>{text}</Text>
    </div>
  )
}

export default PageTitle