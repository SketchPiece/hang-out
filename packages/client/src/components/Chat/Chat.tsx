export const Chat = () => {
  return (
    <div className="bg-gray-600 w-72 rounded-md relative">
      <div className="p-3 flex flex-col gap-3">
        <div>
          <div className="bg-gray-500 rounded-xl py-1 px-3 inline-block">
            Hello there!
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-gray-700 rounded-xl py-1 px-3 inline-block">
            Oh hi mark!
          </div>
        </div>
      </div>
      <form className="absolute bottom-0 p-3 inset-x-0 w-full flex gap-2">
        <input type="text" className="bg-gray-500 h-full rounded-md flex-1" />
        <button className="bg-gray-700 text-white px-2 rounded-md">Send</button>
      </form>
    </div>
  )
}
