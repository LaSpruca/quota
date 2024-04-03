import { Button, Input, Overlay, Text, makeStyles } from "@rneui/themed";
import { useEffect, useState } from "react";
import { View } from "react-native";
import DatePicker from "../DatePicker";

type DeleteButtonProps = {
  onDelete?: () => void;
  stylesheet: ReturnType<typeof createStylesheet>;
};
function DeleteButton({ onDelete, stylesheet }: DeleteButtonProps) {
  if (!onDelete) {
    return <></>;
  }
  return (
    <Button
      color="error"
      title="Delete"
      onPress={onDelete}
      icon={{ name: "trash", color: "white" }}
    />
  );
}

type QuoteOptionsProps = {
  onSubmit: (quote: { quote: string; author: string; date: Date }) => void;
  onDismis: () => void;
  visible: boolean;
  onDelete?: () => void;
  defaultVales?: { quote: string; author: string; date: Date };
};

export default function QuoteOptionsOverlay({
  onSubmit: onSubmitFn,
  onDismis: onDismisFn,
  visible,
  onDelete,
  defaultVales,
}: QuoteOptionsProps) {
  const stylesheet = createStylesheet();
  const [date, setDate] = useState(new Date());
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [dateModalOpen, setDateModalOpen] = useState(false);

  useEffect(() => {
    setDate(defaultVales?.date ?? date);
    setAuthor(defaultVales?.author ?? author);
    setQuote(defaultVales?.quote ?? quote);
  }, [defaultVales]);

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
        <View style={[stylesheet.buttonsContainer]}>
          <DeleteButton onDelete={onDelete} stylesheet={stylesheet} />
          <Button
            title={onDelete ? "Add" : "Update"}
            onPress={() => onSubmit({ quote, author, date })}
          />
          <Button type="clear" title="Cancel" onPress={() => onDismis()} />
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

    buttonsContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10,
      paddingTop: 10,
    },
  };
});
