
import React, { useState } from "react";
import { Dialer, Manager, useFlexSelector } from "@twilio/flex-ui";
import {
  Label,
  TextArea,
  RadioGroup,
  Radio,
  Text,
  Select,
  Option,
  HelpText,
  Separator,
  Box,
} from "@twilio-paste/core";

import {
  Container,
  StyledSidePanel,
  DialerContainer,
  MessageContainer,
  SendMessageContainer,
  MessageTypeContainer,
  OfflineContainer,
  ErrorIcon,
} from "./OutboundMessagePanel.Components";
import SendMessageMenu from "./SendMessageMenu";
import { onSendClickHandler, handleClose } from "./clickHandlers";
import { templates } from "../../utils/templates";
import { PhoneNumberUtil, AsYouTypeFormatter } from "google-libphonenumber";

const isWorkerAvailable = (worker) => {
  const { taskrouter_offline_activity_sid } =
    Manager.getInstance().serviceConfiguration;

  return worker.activity?.sid !== taskrouter_offline_activity_sid; 
};

const hasWorkerWhatsAppSkill = (worker) => {
  return worker.attributes.routing.skills.includes('send_whatsapp')
}

const isToNumberValid = (toNumber) => {
  const phoneUtil = PhoneNumberUtil.getInstance();
  try {
    const parsedToNumber = phoneUtil.parse(toNumber);
    const regionCode = phoneUtil.getRegionCodeForNumber(parsedToNumber);

    if (phoneUtil.isPossibleNumber(parsedToNumber))
      if (phoneUtil.isValidNumber(parsedToNumber)) return true;

    return false;
  } catch (error) {
    return false;
  }
};

const OutboundMessagePanel = (props) => {
  // Local state
  const [toNumber, setToNumber] = useState("+521");
  const [messageType, setMessageType] = useState("whatsapp");

  // Redux state
  const isOutboundMessagePanelOpen = useFlexSelector(
    (state) =>
      state.flex.view.componentViewStates?.outboundMessagePanel
        ?.isOutboundMessagePanelOpen
  );
  const worker = useFlexSelector((state) => state.flex.worker);

  // valid phone number and message so OK to enable send button?
  let disableSend = true;
  const toNumberValid = isToNumberValid(toNumber);

  if (toNumberValid && select_template.value !== "0") disableSend = false;

  // if we navigate away clear state
  if (!isOutboundMessagePanelOpen) {
    if (toNumber !== "+521") setToNumber("+521");
    return null;
  }

  // convert +1661877 to +"1 661-877"
  let friendlyPhoneNumber = null;
  const formatter = new AsYouTypeFormatter();
  [...toNumber].forEach((c) => (friendlyPhoneNumber = formatter.inputDigit(c)));

  // Send clicked handler
  const handleSendClicked = (menuItemClicked) => {
    onSendClickHandler(menuItemClicked, toNumber, messageType, templates[select_template.value]);
  };

  return (
    <Container>
      <StyledSidePanel
        displayName="Message"
        themeOverride={props.theme && props.theme.OutboundDialerPanel}
        handleCloseClick={handleClose}
        title="Message"
      >
        {isWorkerAvailable(worker) && hasWorkerWhatsAppSkill(worker) && (
          <>
            <MessageTypeContainer theme={props.theme}>
              <RadioGroup
                name="messageType"
                value={messageType}
                legend="Message type"
                onChange={(newValue) => {
                  setMessageType(newValue);
                }}
                orientation="horizontal"
              >
                <Radio id="whatsapp" value="whatsapp" name="whatsapp">
                  Whatsapp
                </Radio>
              </RadioGroup>
              <Text
                paddingTop={props.theme.tokens.spacings.space20}
                color={
                  toNumberValid
                    ? props.theme.tokens.textColors.colorTextSuccess
                    : props.theme.tokens.textColors.colorTextErrorLight
                }
              >
                {messageType === "whatsapp"
                  ? "whatsapp:" + toNumber
                  : friendlyPhoneNumber}
              </Text>
            </MessageTypeContainer>

            <DialerContainer theme={props.theme}>
              <Dialer
                key="dialer"
                onDial={setToNumber}
                defaultPhoneNumber={toNumber}
                onPhoneNumberChange={setToNumber}
                hideActions
                disabled={false}
                defaultCountryAlpha2Code={"MX"}
              />
            </DialerContainer>
            <MessageContainer theme={props.theme}>
              <Label htmlFor="select_template">Select a message template</Label>
              <Select
                id="select_template"
              >
                {templates.map((template,index) => (
                  <Option value={index} key="select_template_{index}">
                    {template || "Type message"}
                  </Option>
                ))}
              </Select>
              <HelpText html_for="select_template" variant="default">Selecciona una plantilla</HelpText>

              <SendMessageContainer theme={props.theme}>
                <SendMessageMenu
                  disableSend={disableSend}
                  onClickHandler={handleSendClicked}
                />
              </SendMessageContainer>
            </MessageContainer>
          </>
        )}
        {!isWorkerAvailable(worker) && (
          <OfflineContainer theme={props.theme}>
            <ErrorIcon />
            {`To send a message, please change your status from ${worker.activity.name}`}
          </OfflineContainer>
        )}
        {isWorkerAvailable(worker) && !hasWorkerWhatsAppSkill(worker) && (
          <OfflineContainer theme={props.theme}>
            <ErrorIcon />
            {`You do not have the right skills to send WhatsApp messages, please talk to your supervisor.`}
          </OfflineContainer>
        )}
      </StyledSidePanel>
    </Container>
  );
};

export default OutboundMessagePanel;
