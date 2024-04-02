import { useEffect } from "react";
import { DatePickerProps } from ".";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

export default function Android({
  visible,
  date,
  onDateChange,
}: DatePickerProps) {
  useEffect(() => {
    if (visible) {
      DateTimePickerAndroid.open({
        value: date,
        onChange: (_, date) => onDateChange(date),
        maximumDate: new Date(),
      });
    }
  }, [visible]);
  return <></>;
}
