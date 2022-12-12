import { useId } from 'react'
import { useForm } from 'react-hook-form'

interface FieldValues {
  username: string
  roomId: string
}

export const Root = () => {
  const usernameInputId = useId()
  const roomInputId = useId()

  const { register } = useForm<FieldValues>()
  return (
    <form className="flex flex-col">
      <label htmlFor={usernameInputId}>Username</label>
      <input
        id={usernameInputId}
        type="text"
        className="bg-gray-500 rounded-md"
        {...register('username')}
      />
      <label htmlFor={roomInputId}>Room Id</label>
      <input
        id={roomInputId}
        type="text"
        className="bg-gray-500 rounded-md"
        {...register('roomId')}
      />
      <button type="submit" className="bg-blue-500 rounded-md mt-1">
        Continue
      </button>
    </form>
  )
}
