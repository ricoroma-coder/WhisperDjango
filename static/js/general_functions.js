export const time_to_decimal = function (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const decimalValue = hours + minutes / 60;

      return decimalValue;
    },
    decimal_to_seconds = function (decimal) {
        let minutes = Math.floor(decimal),
            seconds = (decimal - minutes) * 60

        return minutes * 60 + seconds
    },
    calc_time = function (minutes, seconds, max) {
        minutes = seconds <= 59 ? minutes : minutes + 1
        seconds = seconds < 60 ? seconds + 1 : 0
        let acc = minutes * 60 + seconds,
            perc = (acc * 100) / max

        return { minutes, seconds, acc, perc }
    }
