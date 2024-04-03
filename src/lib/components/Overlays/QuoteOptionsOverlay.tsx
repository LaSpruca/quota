import { Button, Input, Overlay, Text, makeStyles } from "@rneui/themed";
import { useState } from "react";
import { View } from "react-native";
import DatePicker from "../DatePicker";

type DeleteButtonProps = {
  onDelete?: () => void;
};
function DeleteButton({ onDelete }: DeleteButtonProps) {
  if (!onDelete) {
    return <></>;
  }
  return (
    <Button
      color="error"
      title="Delete"
      onPress={onDelete}
      icon={{ name: "trash" }}
    />
  );
}

type QuoteOptionsProps = {
  onSubmit: (quote: { quote: string; author: string; date: Date }) => void;
  onDismis: () => void;
  visible: boolean;
  onDelete?: () => void;
};

export default function QuoteOptionsOverlay({
  onSubmit: onSubmitFn,
  onDismis: onDismisFn,
  visible,
  onDelete,
}: QuoteOptionsProps) {
  const stylesheet = createStylesheet();
  const [date, setDate] = useState(new Date());
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const reset = () => {
    setDate(new Date());
    setQuote("");
    setAuthor("");
    setDateModalOpen(false);
  };
  const onDismis = () => {
    reset();
    onDismisFn();
  };

  const onSubmit: QuoteOptionsProps["onSubmit"] = (args) => {
    reset();
    onSubmitFn(args);
  };

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
        <DeleteButton onDelete={onDelete} />
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
