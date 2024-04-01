import { Button, Input, Overlay } from "@rneui/themed";
import { useState } from "react";
import { View } from "react-native";
import DatePicker from "react-native-date-picker";

type AddQuoteOverlayProps = {
  onSubmit: (quote: { quote: string; author: string; date: Date }) => void;
  onDismis: () => void;
  visible: boolean;
};

export default function AddQuoteOverlay({
  onSubmit,
  onDismis,
  visible,
}: AddQuoteOverlayProps) {
  const [date, setDate] = useState(new Date());
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  return (
    <Overlay
      isVisible={visible}
      onDismiss={onDismis}
      onBackdropPress={onDismis}
    >
      <View>
        <Input label="Quote" value={quote} onChangeText={setQuote} />
        <Input label="Author" value={author} onChangeText={setAuthor} />
        <DatePicker
          mode="date"
          date={date}
          onDateChange={setDate}
          maximumDate={new Date()}
        />
        <View>
          <Button type="clear" title="Cancel" />
          <Button
            title="submit"
            onPress={() => onSubmit({ quote, author, date })}
          />
        </View>
      </View>
    </Overlay>
  );
}
