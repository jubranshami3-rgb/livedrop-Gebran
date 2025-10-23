import React from 'react'
import { Input } from '../atoms/input'
import { Search } from 'lucide-react'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = "Search products..."
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 w-full"
      />
    </div>
  )
}