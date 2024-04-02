import { Platform } from "react-native";
import Android from "./Android";
import EverythingElse from "./EverythingElse";

export type DatePickerProps = {
  onDateChange: (newDate: Date) => void;
  visible: boolean;
  date: Date;
};

export default function DatePicker(props: DatePickerProps) {
  if (Platform.OS === "android") {
    return <Android {...props} />;
  } else {
    return <EverythingElse {...props} />;
  }
}
