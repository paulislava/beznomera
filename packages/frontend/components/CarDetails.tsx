import styled from 'styled-components/native';
import { CarImage } from './CarImage/CarImage';
import { TextL, StyledViewContainer } from './Themed';
import { Image } from 'react-native';

export const CarModel = styled(TextL)`
  font-weight: 100;
  flex: 1;
`;

export const CarModelBrand = styled(CarModel)`
  text-align: right;
`;

export const CarNumber = styled(TextL)`
  font-weight: 200;
  margin-top: 20px;
`;

export const ModelRow = styled(StyledViewContainer)`
  flex-flow: row;
  width: 100%;
`;

export const BrandLogo = styled(Image)`
  margin: 0 10px;
  width: 100px;
  height: 21.5px;
`;

export const StyledCarImage = styled(CarImage)`
  margin: 20px auto 40px;
  width: calc(100% - 40px);
  max-width: 400px;
  height: auto;
`;

export const Nickname = styled(TextL)`
  margin-bottom: 20px;
`;

export const CarExternalImage = styled(Image)<{ $aspectRatio: Maybe<number> }>`
  margin: 40px auto;
  width: calc(100% - 40px);
  max-width: 400px;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio ?? 400 / 125};
`;
