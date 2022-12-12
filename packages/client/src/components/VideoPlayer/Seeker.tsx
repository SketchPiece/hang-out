import classNames from 'classnames'
import { FC, useState } from 'react'
import ReactSlider from 'react-slider'

interface SeekerProps {
  value?: number
  onChange?: (value: number) => void
  duration?: number
  currentTime?: number
}

export const Seeker: FC<SeekerProps> = ({
  value,
  onChange,
  duration = 0,
  currentTime = 0
}) => {
  const [isHovering, setIsHovering] = useState(false)
  const formatedDuration =
    Math.floor(currentTime / 60) +
    ':' +
    ('0' + Math.floor(currentTime % 60)).slice(-2)
  const formatedCurrentTime =
    Math.floor(duration / 60) +
    ':' +
    ('0' + Math.floor(duration % 60)).slice(-2)

  return (
    <div
      className="w-full relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <ReactSlider
        className="progress"
        thumbClassName="progress-thumb"
        trackClassName="progress-track"
        value={value}
        onChange={onChange}
        step={0.1}
        renderThumb={props => (
          <div {...props}>
            <div className="inner-thumb-container">
              <div
                className={classNames('inner-thumb', isHovering && 'active')}
              ></div>
            </div>
          </div>
        )}
      />
      <span className="text-xs absolute bottom-2 right-0 select-none">
        {formatedDuration} / {formatedCurrentTime}
      </span>
    </div>
  )
}
