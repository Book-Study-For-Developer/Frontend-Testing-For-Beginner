import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { vi } from "vitest";
import { MultiSelectChipGroup } from "./MultiSelectChipGroup";
import type {
  MultiSelectChipGroupProps,
  SelectChipChildrenProps
} from "./SelectChip.type";
import { VALUES } from "./shared/mock";

let user: ReturnType<typeof userEvent.setup>;

const renderMultiSelectChipGroup = ({
  multiSelectChipGroupProps,
  selectChipChildrenProps
}: {
  multiSelectChipGroupProps?: Partial<MultiSelectChipGroupProps>;
  selectChipChildrenProps?: Partial<SelectChipChildrenProps>;
} = {}) =>
  render(
    <MultiSelectChipGroup
      {...multiSelectChipGroupProps}
      onChange={multiSelectChipGroupProps?.onChange ?? (() => {})}>
      <MultiSelectChipGroup.Item value="all" {...selectChipChildrenProps}>
        all
      </MultiSelectChipGroup.Item>
      {VALUES.map((value) => (
        <MultiSelectChipGroup.Item
          key={value}
          value={value}
          {...selectChipChildrenProps}>
          {value}
        </MultiSelectChipGroup.Item>
      ))}
    </MultiSelectChipGroup>
  );

const onChange = vi.fn();
beforeEach(() => {
  user = userEvent.setup();
  onChange.mockClear();
});

describe("MultiSelectChipGroup", () => {
  describe("MultiSelectChipGroup 초기 설정", () => {
    it('role="group"을 가져야한다', () => {
      const { getByRole } = renderMultiSelectChipGroup();
      expect(getByRole("group")).toBeInTheDocument();
    });

    it("value array를 받으면 해당 라벨은 checked로 설정해야한다.", () => {
      const { getByLabelText } = renderMultiSelectChipGroup({
        multiSelectChipGroupProps: { value: [VALUES[0], VALUES[1]] }
      });
      const initialCheckedRadio = getByLabelText(VALUES[0]);
      expect(initialCheckedRadio).toBeChecked();

      const secondCheckedRadio = getByLabelText(VALUES[1]);
      expect(secondCheckedRadio).toBeChecked();
    });

    it("defaultValue를 받으면 해당 라벨은 checked로 설정해야한다.", () => {
      const { getByLabelText } = renderMultiSelectChipGroup({
        multiSelectChipGroupProps: { defaultValue: [VALUES[0], VALUES[1]] }
      });
      const initialCheckedRadio = getByLabelText(VALUES[0]);
      expect(initialCheckedRadio).toBeChecked();

      const secondCheckedRadio = getByLabelText(VALUES[1]);
      expect(secondCheckedRadio).toBeChecked();
    });

    it("defaultValue와 value가 없으면 체크된 값이 없어야 한다.", () => {
      const { getAllByRole } = renderMultiSelectChipGroup();
      const checkboxes = getAllByRole("checkbox", { hidden: true });
      checkboxes.forEach((checkbox) => expect(checkbox).not.toBeChecked());
    });

    it("초기 value에 all이 포함되어있다면 View 전부를 체크해야한다.", () => {
      const { getAllByRole } = renderMultiSelectChipGroup({
        multiSelectChipGroupProps: { value: ["all"] }
      });

      const checkboxes = getAllByRole("checkbox", { hidden: true });
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });

    it("초기 defaultValue가 all이라면 전부를 체크해야한다.", () => {
      const { getAllByRole } = renderMultiSelectChipGroup({
        multiSelectChipGroupProps: { defaultValue: ["all"] }
      });

      const checkboxes = getAllByRole("checkbox", { hidden: true });
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });

    it("부모가 disabled prop가 true일 때 모든 라디오 버튼들이 비활성화되어야 함", () => {
      const { getAllByRole } = renderMultiSelectChipGroup({
        multiSelectChipGroupProps: { disabled: true }
      });
      const checkboxes = getAllByRole("checkbox", { hidden: true });
      checkboxes.forEach((checkbox) => expect(checkbox).toBeDisabled());
    });

    it("자식이 disabled prop을 받으면 이에 맞추어 활성화되어야함", () => {
      const { getAllByRole } = render(
        <MultiSelectChipGroup onChange={() => {}}>
          {VALUES.map((value, index) => (
            <MultiSelectChipGroup.Item
              key={value}
              value={value}
              disabled={index === 0}>
              {value}
            </MultiSelectChipGroup.Item>
          ))}
        </MultiSelectChipGroup>
      );
      const checkboxes = getAllByRole("checkbox", { hidden: true });
      checkboxes.forEach((checkbox, index) => {
        if (index === 0) {
          expect(checkbox).toBeDisabled();
        } else {
          expect(checkbox).not.toBeDisabled();
        }
      });
    });
  });
});

describe("상호 작용 테스트", () => {
  describe("onChange 테스트", () => {
    it("onChange를 인자로 주면 첫번째 인자는 event, 두번째 인자는 배열을 준다.", async () => {
      const { getByLabelText } = renderMultiSelectChipGroup({
        multiSelectChipGroupProps: { onChange }
      });

      const checkbox = getByLabelText(VALUES[0]);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: VALUES[0] })
        }),
        [VALUES[0]]
      );
    });

    it("all을 선택하면 onChange 첫번째 인자로 all, 두번째인자는 전체 배열을 넘겨줘야한다.", async () => {
      const { getByLabelText } = renderMultiSelectChipGroup({
        multiSelectChipGroupProps: { onChange }
      });

      const allValueRadio = getByLabelText("all");

      await user.click(allValueRadio);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: "all" })
        }),
        ["all", ...VALUES]
      );
    });

    it("all을 선택한 상태에서 다시 클릭하면 onChange 첫번째 인자에는 all을 두번째인자에는 빈배열을 넘겨줘야한다.", async () => {
      const { getByLabelText } = renderMultiSelectChipGroup({
        multiSelectChipGroupProps: { value: ["all"], onChange }
      });
      const allValueRadio = getByLabelText("all");

      await user.click(allValueRadio);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: "all" })
        }),
        []
      );
    });

    it("all을 value로 주고 다시 클릭하면 onChange 첫번째 인자에는 all을 두번째인자에는 빈배열을 넘겨줘야한다.", async () => {
      const { getByLabelText } = renderMultiSelectChipGroup({
        multiSelectChipGroupProps: { value: ["all"], onChange }
      });
      const allValueRadio = getByLabelText("all");

      await user.click(allValueRadio);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: "all" })
        }),
        []
      );
    });

    it("all을 defaultValue로 주고 다시 클릭하면 onChange 첫번째 인자에는 all을 두번째인자에는 빈배열을 넘겨줘야한다.", async () => {
      const { getByLabelText } = renderMultiSelectChipGroup({
        multiSelectChipGroupProps: { defaultValue: ["all"], onChange }
      });
      const allValueRadio = getByLabelText("all");

      await user.click(allValueRadio);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: "all" })
        }),
        []
      );
    });
  });

  describe("value를 받으면 controlled 상태로 DI를 통해 상태관리를 한다.", () => {
    it("새로운 것을 선택하면, 추가해서 배열로 넘겨줍니다.", async () => {
      const ControlledComponent = ({
        initialValue,
        onChange
      }: {
        initialValue?: string[];
        onChange: (array?: string[]) => void;
      }) => {
        const [value, setValue] = useState(initialValue);

        return (
          <MultiSelectChipGroup
            value={value}
            onChange={(e, allValues) => {
              setValue(allValues);
              onChange(allValues);
            }}>
            {VALUES.map((val) => (
              <MultiSelectChipGroup.Item key={val} value={val}>
                {val}
              </MultiSelectChipGroup.Item>
            ))}
          </MultiSelectChipGroup>
        );
      };

      const { getByLabelText } = render(
        <ControlledComponent initialValue={[VALUES[0]]} onChange={onChange} />
      );
      const checkbox = getByLabelText(VALUES[0]);
      expect(checkbox).toBeChecked();

      const addCheckbox = getByLabelText(VALUES[1]);
      expect(addCheckbox).not.toBeChecked();

      await user.click(addCheckbox);
      expect(addCheckbox).toBeChecked();
      expect(checkbox).toBeChecked();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith([VALUES[0], VALUES[1]]);
    });
  });

  it("새로운 것이 ALL이라면 전체를 배열로 넘겨줍니다.", async () => {
    const ControlledComponent = ({
      initialValue,
      onChange
    }: {
      initialValue?: string[];
      onChange: (array?: string[]) => void;
    }) => {
      const [value, setValue] = useState(initialValue);

      return (
        <MultiSelectChipGroup
          value={value}
          onChange={(e, allValues) => {
            setValue(allValues);
            onChange(allValues);
          }}>
          <MultiSelectChipGroup.Item value="all">all</MultiSelectChipGroup.Item>
          {VALUES.map((val) => (
            <MultiSelectChipGroup.Item key={val} value={val}>
              {val}
            </MultiSelectChipGroup.Item>
          ))}
        </MultiSelectChipGroup>
      );
    };

    const { getByLabelText, getAllByRole } = render(
      <ControlledComponent initialValue={[VALUES[0]]} onChange={onChange} />
    );
    const checkbox = getByLabelText(VALUES[0]);
    expect(checkbox).toBeChecked();

    const addCheckbox = getByLabelText("all");
    expect(addCheckbox).not.toBeChecked();

    await user.click(addCheckbox);
    const checkboxes = getAllByRole("checkbox", { hidden: true });
    checkboxes.forEach((checkbox) => expect(checkbox).toBeChecked());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(["all", ...VALUES]);
  });
});

describe("value 값이 없으면 uncontrolled 내부 상태로 관리한다", () => {
  it("onChange가 없어도 내부상태를 업데이트합니다.", async () => {
    const { getByLabelText } = renderMultiSelectChipGroup();
    const checkbox = getByLabelText(VALUES[0]);

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("value를 undefined로 받으면 uncontrolled로 상태관리를 한다.", async () => {
    const { getByLabelText } = renderMultiSelectChipGroup({
      multiSelectChipGroupProps: { value: undefined, onChange }
    });

    const newCheckbox = getByLabelText(VALUES[1]);
    expect(newCheckbox).not.toBeChecked();

    await user.click(newCheckbox);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: VALUES[1]
        })
      }),
      [VALUES[1]]
    );
    expect(newCheckbox).toBeChecked();
  });

  it("내부 상태관리 하는 값을 onChange를 통해 외부에서 확인할 수 있다.", async () => {
    const { getByLabelText } = renderMultiSelectChipGroup({
      multiSelectChipGroupProps: { defaultValue: [VALUES[0]], onChange }
    });

    const checkbox = getByLabelText(VALUES[0]);
    expect(checkbox).toBeChecked();

    const newCheckbox = getByLabelText(VALUES[1]);
    expect(newCheckbox).not.toBeChecked();

    await user.click(newCheckbox);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: VALUES[1]
        })
      }),
      [VALUES[0], VALUES[1]]
    );
    expect(checkbox).toBeChecked();
    expect(newCheckbox).toBeChecked();
  });

  it("내부 상태로 관리할 경우, all을 checked하면 모든 값이 선택되어야하고, 다시 누르면 선택한 값이 없어야한다.", async () => {
    const { getByLabelText, getAllByRole } = renderMultiSelectChipGroup();
    const allValueRadio = getByLabelText("all");

    await user.click(allValueRadio);
    const checkboxes = getAllByRole("checkbox", { hidden: true });
    checkboxes.forEach((checkbox) => expect(checkbox).toBeChecked());

    await user.click(allValueRadio);
    checkboxes.forEach((checkbox) => expect(checkbox).not.toBeChecked());
  });
});
