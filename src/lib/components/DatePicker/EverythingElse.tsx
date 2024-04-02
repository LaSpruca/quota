import RNDateTimePicker from "@react-native-community/datetimepicker";
import { DatePickerProps } from ".";

export default function EverythingElse({
  date,
  visible,
  onDateChange,
}: DatePickerProps) {
  if (visible) {
    return (
      <RNDateTimePicker
        value={date}
        onChange={(_, date) => {
          onDateChange(date);
        }}
        maximumDate={new Date()}
      />
    );
  }
}
