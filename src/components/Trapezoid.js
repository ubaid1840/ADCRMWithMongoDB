import {Canvas, Path, Skia} from "@shopify/react-native-skia";
 
const path = Skia.Path.Make();
path.moveTo(75, 0);
path.lineTo(150, 50);
path.lineTo(0, 50);
path.lineTo(0, 0);
path.close();
 
const RectDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Path
        path={path}
        color="lightblue"
      />
    </Canvas>
  );
};

export default RectDemo