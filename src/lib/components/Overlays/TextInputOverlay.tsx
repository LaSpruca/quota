import { Button, Input, Overlay, makeStyles } from "@rneui/themed";
import { useEffect, useState } from "react";
import { Dimensions, InputModeOptions, View } from "react-native";

type AddMemberOverlayProps = {
  onDismis: () => void;
  onSubmit: (text: string) => void;
  defaultText?: string;
  label: string;
  inputMode: InputModeOptions;
  visible: boolean;
  okText?: string;
  cancelText?: string;
};

export default function AddMemberOverlay({
  onSubmit: onSubmitFn,
  onDismis: onDismisFn,
  defaultText,
  label,
  visible,
  inputMode,
  cancelText,
  okText,
}: AddMemberOverlayProps) {
  const stylesheet = createStylesheet();
  const [text, setText] = useState(defaultText ?? "");
  useEffect(() => {
    setText(defaultText ?? "");
  }, [defaultText]);

  const onDismis = () => {
    setText("");
    onDismisFn();
  };

  const onSubmit: AddMemberOverlayProps["onSubmit"] = (text) => {
    onSubmitFn(text);
    setText("");
  };

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onDismis}
      animationType="fade"
      overlayStyle={[stylesheet.container]}
    >
      <Input
        label={label}
        inputMode={inputMode}
        value={text}
        onChangeText={setText}
      />
      <View style={[stylesheet.buttonContainer]}>
        <Button title={cancelText ?? "Cancel"} onPress={onDismis} />
        <Button title={okText ?? "Ok"} onPress={() => onSubmit(text)} />
      </View>
    </Overlay>
  );
}

const createStylesheet = makeStyles(() => {
  return {
    buttonContainer: {
      display: "flex",
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      justifyContent: "flex-end",
      padding: 10,
    },
    container: {
      maxWidth: Dimensions.get("window").width * 0.8,
    },
  };
});
