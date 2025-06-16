import { type Component } from 'solid-js';
import { Flex } from '~/lib/solidui/flex';
import { NumberField, NumberFieldDecrementTrigger, NumberFieldGroup, NumberFieldIncrementTrigger, NumberFieldInput, NumberFieldLabel } from '~/lib/solidui/number-field';
import { Separator } from '~/lib/solidui/separator';

interface MapEditGUIProps {
  tileRadius: number;
  onSetTileRadius: (v: number) => void;
  tileCost: number;
  onSetTileCost: (v: number) => void;
}

const MapEditGUI: Component<MapEditGUIProps> = (props) => {
  return <>
    <Flex justifyContent='between' alignItems='center' class='gap-3'>
      <NumberField class="w-36" minValue={5} rawValue={props.tileRadius} onRawValueChange={props.onSetTileRadius}>
        <NumberFieldLabel>Tamanho do bloco</NumberFieldLabel>
        <NumberFieldGroup>
          <NumberFieldInput />
          <NumberFieldIncrementTrigger />
          <NumberFieldDecrementTrigger />
        </NumberFieldGroup>
      </NumberField>

      <Separator orientation="vertical" class='h-1/2 self-end mb-1' />

      <NumberField class="w-36" minValue={0} rawValue={props.tileCost} onRawValueChange={props.onSetTileCost}>
        <NumberFieldLabel>Custo de movimento</NumberFieldLabel>
        <NumberFieldGroup>
          <NumberFieldInput />
          <NumberFieldIncrementTrigger />
          <NumberFieldDecrementTrigger />
        </NumberFieldGroup>
      </NumberField>
    </Flex>
  </>;
};

export default MapEditGUI;