import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'

const DropdownForJournal = () => {
  const [value, setValue] = useState(null)

  const data = [
    { label: 'Периоды по умолчанию', value: '1' },
    { label: 'Периоды по дням', value: '2' },
    { label: 'Выбрать период', value: '3' },
  ]

  return (
    <Dropdown
      data={data}
      maxHeight={300}
      labelField="label"
      activeColor="#6E368C"
      valueField="value"
      placeholder="Выберите пункт"
      value={value}
      onChange={(item) => {
        setValue(item.value)
      }}
    />
  )
}
export default DropdownForJournal
