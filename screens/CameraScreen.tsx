import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { SafeAreaView } from "react-native-safe-area-context";
import * as tf from "@tensorflow/tfjs";
import * as FileSystem from "expo-file-system";

import {
  fetch,
  decodeJpeg,
  bundleResourceIO,
} from "@tensorflow/tfjs-react-native";
import { expandDims } from "@tensorflow/tfjs";
import { useFocusEffect } from "@react-navigation/native";

export default function App(props) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(null);
  const [type, setType] = useState("back");
  const cameraReference = useRef(null);
  const [image, setImage] = useState(null);
  const [state, setState] = useState(null);
  const [disease, setDisease] = useState(null);
  const makePrediction = async () => {
    {
      try {
        const mobileNetJson = require("../assets/model.json");
        console.log(mobileNetJson.format.toString + "json loaded");
        const mobileNetWeights = require("../assets/weights.bin");
        console.log(mobileNetWeights.toString + "weights loaded");

        await tf.ready();
        const model = await tf.loadGraphModel(
          bundleResourceIO(mobileNetJson, mobileNetWeights)
        );
        const fileUri = image;
        const imgB64 = await FileSystem.readAsStringAsync(fileUri.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        //  const imageAssetPath = Image.resolveAssetSource(image);
        //  console.log(imageAssetPath.uri);
        //  const response1 = await fetch(imageAssetPath.uri, {}, { isBinary: true });
        // const imageDataArrayBuffer1 = await response1.arrayBuffer();
        const imgBuffer = tf.util.encodeString(imgB64, "base64").buffer;

        const imageData1 = new Uint8Array(imgBuffer);
        const imageTensor1 = decodeJpeg(imageData1).resizeBilinear([224, 224]);

        // const imageUri = "https://i.imgur.com/IoKwUPx.jpg";
        // const response = await fetch(imageUri, {}, { isBinary: true });
        // const imageDataArrayBuffer = await response.arrayBuffer();
        // const imageData = new Uint8Array(imageDataArrayBuffer);

        // Decode image data to a tensor
        //const imageTensor = decodeJpeg(imageData).resizeBilinear([224, 224]);

        const expandedImageTensor = expandDims(imageTensor1, 0);
        const res = model.predict(expandedImageTensor) as tf.Tensor;
        res.print();
        const predictedClassNumber = res.reshape([10]).argMax();

        const myResult = tf.util
          .flatten(predictedClassNumber.toString())
          .toString();

        await setState(myResult[11]);
        console.log(state);
        console.log(myResult[11]);
        if (state === "0") setDisease("Bacterial Spot");
        else if (state === "1") setDisease("Early Blight");
        else if (state === "2") setDisease("no diseases setected! Healthy!");
        else if (state === "3") setDisease("Late Blight");
        else if (state === "4") setDisease("Leaf Mold");
        else if (state === "5") setDisease("Sptoria Lead Spot");
        else if (state === "6") setDisease("Spider Mites");
        else if (state === "7") setDisease("Target Spot");
        else if (state === "8") setDisease("Tomato Mosaic Virus");
        else if (state === "9") setDisease("Tomato Yellow Leaf Curl Virus");
        else setDisease("invalid input");
      } catch (err) {
        console.log(err);
      }
    }
  };
  const clickAndPredict = async () => {
    const picture = await cameraReference.current.takePictureAsync();
    console.log(picture);
    setImage(picture);
  };
  useFocusEffect(() => {
    (async () => {
      const CameraPermission = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(CameraPermission.status === "granted");
      const MediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(MediaLibraryPermission.status === "granted");
    })();
  });

  if (hasCameraPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (hasMediaLibraryPermission === null) {
    return <Text>Media library not found</Text>;
  }
  if (hasMediaLibraryPermission === false) {
    return <Text>No access to Library</Text>;
  }

  let savePicture = () => {
    MediaLibrary.saveToLibraryAsync(image.uri).then(() => {
      console.log("This is after saving to library" + image.uri);
      makePrediction();
    });
  };
  if (image) {
    return (
      <SafeAreaView>
        <Image style={styles.imageWrapper} source={{ uri: image.uri }}></Image>
        {hasMediaLibraryPermission && (
          <TouchableOpacity onPress={image ? savePicture : null}>
            <Text style={styles.text2}>Predict</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setImage(undefined)}>
          <Text style={styles.text2}>Discard/Retake</Text>
        </TouchableOpacity>
        {disease && <Text>Your Plant is {disease}</Text>}
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        ref={(r) => (cameraReference.current = r)}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={clickAndPredict}>
            <Text style={styles.text}> Click </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
  },
  button: {
    flex: 0.5,
    alignSelf: "auto",
    alignItems: "center",
  },
  text: {
    width: 50,
    margin: 10,
    fontSize: 30,
    color: "white",
  },
  text2: {
    width: 90,
    margin: 10,
    fontSize: 20,
    color: "black",
  },
  imageWrapper: {
    height: 224,
    width: 224,
    alignSelf: "stretch",
  },
});
