import { FC } from 'react'
import { useForm } from 'react-hook-form'

interface FieldValues {
  source: string
}

interface LinkInputProps {
  onChange?: (source: string) => void
}

export const LinkInput: FC<LinkInputProps> = ({ onChange }) => {
  const { register, handleSubmit } = useForm<FieldValues>()
  const onSubmit = ({ source }: FieldValues) => {
    onChange && onChange(source)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        className="w-full bg-gray-500 h-full rounded-md border-none"
        {...register('source')}
      />
    </form>
  )
}
