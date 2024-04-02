import { Button, Input, Overlay, Text, makeStyles } from "@rneui/themed";
import { useState } from "react";
import { View } from "react-native";
import DatePicker from "./DatePicker";

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
  const stylesheet = createStylesheet();
  const [date, setDate] = useState(new Date());
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [dateModalOpen, setDateModalOpen] = useState(false);

  return (
    <Overlay
      isVisible={visible}
      onDismiss={onDismis}
      onBackdropPress={onDismis}
      animationType="fade"
    >
      <View>
        <Input label="Quote" value={quote} onChangeText={setQuote} />
        <Input label="Author" value={author} onChangeText={setAuthor} />
        <View style={[stylesheet.dateContainer]}>
          <Text style={[stylesheet.actualDateText]}>
            <Text style={[stylesheet.dateText]}>Date: </Text>
            {date.getDate()}/{date.getMonth()}/{date.getFullYear()}
          </Text>
          <Button title="Change" onPress={() => setDateModalOpen(true)} />
        </View>
        <DatePicker
          date={date}
          onDateChange={(newDate) => {
            setDate(newDate);
            setDateModalOpen(false);
          }}
          visible={dateModalOpen}
        />
        <View>
          <Button type="clear" title="Cancel" onPress={() => onDismis()} />
          <Button
            title="Submit"
            onPress={() => onSubmit({ quote, author, date })}
          />
        </View>
      </View>
    </Overlay>
  );
}

const createStylesheet = makeStyles(() => {
  return {
    dateText: {
      fontWeight: "bold",
    },

    actualDateText: {},

    dateContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
  };
});
