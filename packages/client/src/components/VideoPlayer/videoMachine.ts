import { assign, createMachine } from 'xstate'

type MachineEvents =
  | { type: 'updateProgress'; value: number }
  | { type: 'mouseEnter' }
  | { type: 'mouseLeave' }
  | { type: 'mouseControlsEnter' }
  | { type: 'mouseControlsLeave' }
  | { type: 'mouseMove' }
  | { type: 'openFullscreen' }
  | { type: 'closeFullscreen' }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'mute' }
  | { type: 'unmute' }

export const videoMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDcCWEwHsCyBDAxgBaoB2YAdCZgC4ASmyYATpAMQC2mArrGAKIlqzANoAGALqJQAB0yxU1VJhJSQAD0QBGABybyAZgAs+gOwBWADQgAnol3kzAX0dW0GHAWJlyhBszacPGAAMmC4jGKSSCCy8orKqhoI+pr65ABsmiY65la2CJpmAEzk2drmzq7oWHhEpBScjAAqmAByNPSMLBCsfIyCAASakaqxCkoq0UlFoqLkogCcppY2WmYmBqLp6YZbRU6VIFQY8NFuNZ71o3LjCVOIALTpeY-ph+cedd5UdH7d13EJolEIYii8ENoiu9qp8vBRfF1IADbpNQEl9ClyNoFnsVvlIdD3LU4eRGmAWu1foiIMj4qj1IgitiHGZDOlynjGfo5ppUkzNPtnM4gA */

  /** @xstate-layout N4IgpgJg5mDOIC5QDcCWEwHsCyBDAxgBaoB2YAdCZgC4ASmyYATpAMQC2mArrGAKIlqzANoAGALqJQAB0yxU1VJhJSQAD0QBGABybyAZgAs+gOwBWADQgAnol3kzAX0dW0GHAWJlyhBszacPGAAMmC4jGKSSCCy8orKqhoI+pr65ABsmiY65la2CJpmAEzk2drmzq7oWHhEpBScjAAqmAByNPSMLBCsarDUuELkuABmQkwAFGaiogCUrG41nvXkjWAt7XR+3ZGqsQpKKtFJhunkhelFljaIRSkZqUW6V84uIFQY8NGLHnVke3IDgljogALTpPJg9KVEA-WpeChULZdSAAuKHRKIQxFSEIbRFGFw5beXwoiBooFHUBJfT3bQATlEl2u+XxhOqvwRqz8Gw621R0X28Sp6luDIcZlO5RZt30onOj2eTleQA */

  /** @xstate-layout N4IgpgJg5mDOIC5QDcCWEwHsCyBDAxgBaoB2YAdIZsmAE4DKALroxSZowBLV2QDEAW0wBXWGACiJVrQDaABgC6iUAAdMsVI1SYSykAA9EAWgDsAVgCc5ACwBGE3JMAmAMxOAHLadzbAGhAAnogAbFYu7sHuZu5yZibBtrZy7gC+Kf5oGDgExGSUPAzMrPk0tJDkQqJgAJIkgiJiADJguDTySkggahpaOnqGCEZuZuSxFsEm8SYujk7WLv5BCJbk7u5OrrYxchMW5mkZ6Fh4RKQUVKVMLOcF5ZViAPLCjPVVktLtet2a2rqdA0MNuQLC5rBMXJMEmNFsYwat3NYLBZbNZLA54sEDiBMsccmcSnQrsULrwIBUGmAni99LAihRcAAzaQACiScjkAEo+Djsqc8iTCtcCWUyfdKc9Pp1vr0-qAAWYUeQtk4klsEcEwTCEHM5OQTO5JuNxgkHLYsTyTrkKAzhAAbW2wfBlMAkcikAhaGh8TAqF0AMTtDqdYBdktU6h+fX+iA8VjBiNj1nZUXmWqMTjMusiyKcwUztjM1gR5qOvKt5Bt9sdztdHtQXvwtvUYADVeDocUXwjMv6MbW5Dc8x2iQ2Sbk1jTZicSo1FjkLls4XstgSJaylvxAqJN1KdwptT4NLp5EZLJm7K5Frx-IK2+Fe6qtTDXW7v17g2skwHSZBW2TjjzNNxnIbw7HGawnGmaZUTXXE+R3QljwFcpiAwV4mhaNpOylV8ozlYxF1sUZ5zkOYZnCZxpiAkw9XHbwzAhdwkRMFFYLLTdbyQ24yVQsB0LAbAeGfaU32jQYzAkpUXAsDwGJXLwETTFcXFWCwiz2QsEQNCC2I3PIVFtXAAgAIwIABrcgDKMu8rICUgoD4FRcCqYTcNlAxjHMYI9TWcwMXovYtQkoiLAk+IfBBMDUnSbFSz0ihbNM-ALNsmznLECBHMMgJXJ6UT8MGExER8g0FVBMFHHcLVpmnTxzDiDZgmCRwzF068EuypKLIEZ4wDvYQSB61hMqGsBcsjdyAXovVc2cBiolzGYnCChVgTC5rbEizbosOdd2sszrzIqXq71GzKBtG8aezE9NFSiUKk0o5F1mWwJEBq1Z7DCxrmv2LF2AweBOiveCuzyvCPMGJIIWBFwmp2UIEWSV6liMCDrHIbMUVIqcET+3a4PLLc6TBib3yMCx1j1Zr1mNU01LTFw4dUxEcfCjwzRikGic4oV2C4bjSeugqKdBankbpiKJzehAJlU4JwmCSDf3cOG2vg4U72QiAhfyyGjGalTFxkqIFwSDxpdRjNdWk1n2SVjNJhcdWecuLjd1Ffd3JEiGAU-GiVznOSIJ2BigvcGwfHmBFCJcaI1a5uL9uJoVtfJKoqV132CO8PUGPZJFknRqiZZWNYNgXbZdnx2K9o1ysgxrLPJsQLwVKKzaGOsaP4hkxmYa2HMlvAjYXfxBvqxDV13XwT0wGb99lz1MCu570IUYI4q4lNlj7Epjwdtrwnx8DSeXRPWf63nnDwZbhBUQxh6zAVhVu67pSt-1BUogmJMlbH-Sh1koLxupTKwIJ4ZNUpkmdYWpGJrTiJmDU4437O0TnXV2iFU7cUoEcEBIsnAyXhIaIsEFkSImorREODF9TMVYug4+gCjJdQOtZEmN8yagLsLDSBiMYEb3vnmGwYUJJ2FCG4FcACOrMKOqlY8tl7L4P1kxFSEDmpQKRrAmWCsaJNU7rQxE5hOYE3YkwkysjsppSqDrDhwt9bmyVOMVw45nBrCYlqHRmMEgggRNENScQpGsPMclY6rBtxKIBNJKwkRhjQNcOEMwWowQjFRIgwsgcJGYgYaY6RwTuonWPBdXqNjwy33JnHIiMSMxxKZlEDxMM9E+NRExVEJhAmJSOqNU6xSInGEiMvdJcxpj2BYpbEIDTvHhGaf4tpaQUhAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QDcCWEwHsCyBDAxgBaoB2YAdIZsmAE4DKALroxSZowBLV2QDEAW0wBXWGACiJVrQDaABgC6iUAAdMsVI1SYSykAA9EAWgCMJgCwnyAVgBs56wCYAzAA4AnAHZL55wBoQAE9jZzkrC0dbKOd3d2dLRwBfRIC0DBwCYjJKHgZmVhyaWkhyIVEwAEkSQRExABkwXBp5JSQQNQ0tHT1DBCNrGPJHEzco80dXW2dnTwDgvts5R3JXMKnXEy8TTx3k1PQsPCJSCioiphZT3JKysSrS2rAAYR1GWkwAG1gAeWFGGvKLyk7y+kmkLT0HU02l0bV6phc5nIM2GnnccnWnlcrjmxms+JWcmctncjkiq3Mtk8exAaUOmROhToFwKZ14EAe5Xut2erxBPz+fH0sHyFFwADNpAAKUJyOQASj4dIyx2ybLylyZxQ5PO5jyBb0+AsYELaUK6sNA8NcnmWE0mvjJaM8thxQWMrmGNhM1nc9ncZmsI1cNOVRyyV3Ooq1N0eesBfKNVQBYgN-IaTTAptU6mh3ThHsc7nI9lWjjk5ncNpd-ndfXx1kJxNd1nMbci1lDBxVEa1LMj7M5Yl+-x5YLo2fauYtPWMnhG5AxclclLkLoDzmsuL6LtcyOX7nMrmcFiJfq76XDjPV-ZjOseI6FIs1EulJjlCqV3avatyt-VsblCOk7mjCs59K4vrkEeK4WNM4yeMS26mFSi7EuY3hLAk1i7CktLfgyv5RpqAEcsQGApmAGbNIokLTmBBZ9L4jb4pE5aVpBFZtshnrOIuPruK2toNh4F70qqA4aqy1xkQclHYDwIH0fmVrGHExbWMeRZxL6GKbDxXjkOiLoTEuAwTGJPaMuKwgfF8+DFGAJDkKQBBaDQfCYCoTkAGK2fZjkkEpnQMapCAumhjjWGu3irlFyFeJ40GbIhQYjDsvqWT+FA2XZsAOWATnkG5qAefgHzqGAfl5QVTnBXmloGIg3grAG2KViYVI4SYyE7HuHj4mYnjRTEAZZYRFAqB8uCBAARgQADW5BTTN-Z8MIKgQJcAAK7xQMUsCwPVM6MaYJ7Fsutjvhs3iCSM25mMWKIdnYrahGNeFhhNy3TXNi0-at0YrYEpBQHwKi4OUx2hU1EHRTYlaWJ1MRuNiD2bMitpFh2R4uiS40SQDf34EtwO3hD5QQODv3QypsNGCujZhBsAw+kWkw9XWxJyOQGXDUsnjLrKzgE72wPzSTpR-GAt7CCQAjS1TCusLTjXwj6PObBMpL2POAzHg99i83I0WOPOh4mKiIufQRhPi-9ysy9GjtU3Ljuq+BphQc4UWC2iHirOibrzPELFRJ64xm+9bbJHh7AYPAbRfRJdEhXT6vjLYmOouimJo3WpidTz5hrldWKwU4IY25e303qKqcNZ76V7ii2y5245fIe+tpGaXPqhzMlKi9ef7RuwXAyQ3J1hWdnW956GwuFMIxbgXoTLFMJ5uNsNYxJ21fib2dckZPZrKWrxgjKE2dtxiHf5-MRhVo2JcmdsSyCcSw9Ecy0akUOlRGqgXTpfCYyxW5ojvjaB+c4KwrGGlWDCthHDjBXN-SS-4ZIAPjKmRMXwRxTxhurJYe4zZDViHYDuthkJl0xr6SCJgPDvkiOgvsf8sG6mcjyNMSYgHnybksKwVJvDxEWG2RY1CC6VmWGYOUiwYqpS8Kw4+0kiiAWHH8QhIC+ibh5r6GYpJKQIV8DQ5cQwkbILkOiIMQZlGjxPmo2SGAtEXwWBjVcJJOojFiOMHiLh+K+iun6RCgkq77BroTXKAVCp8LTq4hmxYSQVmEUGCRYQu4YiRAGLwJcrqrAxNSA+VlshRPyoFFyJASo0BcZ7SwJZ0SUgykXRYPoeIRXehYHC693zW3CYfay-kykxOKvgdyYAamMRQVYJwwxxgng8ILVej8bRZw6WQtEm9bCsPtiTCZM8RioUutdbYlYgy1kfgSZBOxxgxXLE4QpfTimTV+hLUmv1+x7PptdJmKCXTvhubabcJ54FOkrtiTc85tkvP+mTIGv1QafOITMRcvyroVnLICusLhGxuF9JpUkMxIJbKKdlImryibk0hmICAiLjCuiyZ6IsUxvArkmNuFBfFIhByug4SIGUoUzXJY7D5Z84me3iEiCwh4yHoqLOc5qSU7lyirKZVYw0BXEyWsK6MbtFa0r6Ey8gUqEL-LJHEdl8MkZ3IcH6JBGqhXS1vC7fVZ0hiBmdLoqkWwLXFzMNawJdrY5AA */
  createMachine(
    {
      id: 'videoMachine',
      tsTypes: {} as import('./videoMachine.typegen').Typegen0,
      context: {
        progress: 0
      },
      schema: {
        events: {} as MachineEvents
      },
      states: {
        hoverState: {
          states: {
            notHovered: {
              on: {
                mouseEnter: 'hovered'
              }
            },

            hovered: {
              states: {
                mouseIn: {
                  on: {
                    mouseLeave: 'mouseOut'
                  },

                  states: {
                    mouseControlsOut: {
                      after: {
                        '3000': '#videoMachine.hoverState.hovered.hide'
                      },

                      on: {
                        mouseControlsEnter: 'mouseControlsIn'
                      }
                    },

                    mouseControlsIn: {
                      on: {
                        mouseControlsLeave: 'mouseControlsOut'
                      }
                    }
                  },

                  initial: 'mouseControlsOut'
                },

                mouseOut: {
                  on: {
                    mouseEnter: 'mouseIn'
                  },

                  after: {
                    '1000': '#videoMachine.hoverState.notHovered'
                  }
                },

                hide: {
                  on: {
                    mouseLeave: 'mouseOut',
                    mouseMove: 'mouseIn'
                  }
                }
              },

              initial: 'mouseIn'
            }
          },

          initial: 'notHovered'
        },

        fullscreen: {
          states: {
            inactive: {
              on: {
                openFullscreen: 'active'
              }
            },

            active: {
              on: {
                closeFullscreen: 'inactive'
              }
            }
          },

          initial: 'inactive'
        },

        playback: {
          states: {
            playState: {
              states: {
                playing: {
                  on: {
                    pause: {
                      target: 'paused',
                      actions: 'pause'
                    }
                  }
                },

                paused: {
                  on: {
                    play: {
                      target: 'playing',
                      actions: 'play'
                    }
                  }
                }
              },

              initial: 'paused',

              on: {
                updateProgress: {
                  actions: 'updateProgress'
                }
              }
            },

            muteState: {
              states: {
                unmuted: {
                  on: {
                    mute: 'muted'
                  }
                },

                muted: {
                  on: {
                    unmute: 'unmuted'
                  }
                }
              },

              initial: 'unmuted'
            }
          },

          type: 'parallel'
        }
      },

      type: 'parallel'
    },
    {
      actions: {
        updateProgress: assign({
          progress: (_, event) => event.value
        })
      }
    }
  )
