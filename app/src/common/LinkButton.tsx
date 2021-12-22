import React from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@chakra-ui/react";

const LinkButton = ({
  history,
  location,
  match,
  staticContext,
  to,
  onClick,
  className,
  // ⬆ filtering out props that `button` doesn’t know what to do with.
  ...rest
}: any) => {
  let navigate = useNavigate();

  return (
    <Button
      {...rest}
      onClick={(event) => {
        onClick && onClick(event);
        navigate(to);
      }}
    />
  );
};

export default LinkButton;
