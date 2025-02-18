import { useState } from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhoneNumberInput } from "../phone-number-input";

interface InputProps {
  type?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
  [key: string]: any;
}

interface SequentialInputTestCase {
  input: string;
  expected: string;
  description?: string;
}

// Mock Input 컴포넌트
jest.mock("palette-design-system/components", () => ({
  Input: ({ type, value, onChange, isInvalid, ...props }: InputProps) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      data-invalid={isInvalid}
      {...props}
    />
  )
}));

const TestComponent = ({
  initialPhoneNumber,
  mockOnChangeSave
}: {
  initialPhoneNumber: string;
  mockOnChangeSave: (phoneNumber: string) => void;
}) => {
  const [value, setValue] = useState(initialPhoneNumber);

  const onChangeSave = (phoneNumber: string) => {
    mockOnChangeSave(phoneNumber);
    setValue(phoneNumber);
  };

  return (
    <PhoneNumberInput initialPhoneNumber={value} onChangeSave={onChangeSave} />
  );
};

describe("PhoneNumberInput 컴포넌트", () => {
  const user = userEvent.setup();
  const defaultTestConfig = {
    initialValue: "",
    shouldTab: false
  };

  const runTest = async (
    testCases: SequentialInputTestCase[],
    finalValue: string,
    config = defaultTestConfig
  ) => {
    const mockOnChangeSave = jest.fn();
    const { getByRole } = render(
      <TestComponent
        initialPhoneNumber={config.initialValue}
        mockOnChangeSave={mockOnChangeSave}
      />
    );

    const input = getByRole("textbox");

    for (const { input: value, expected } of testCases) {
      await user.type(input, value);
      if (config.shouldTab) await user.tab();
      expect(getByRole("textbox")).toHaveValue(expected);
    }

    expect(mockOnChangeSave).toHaveBeenLastCalledWith(finalValue);
  };

  describe("국내 번호", () => {
    const koreanNumberCases: SequentialInputTestCase[] = [
      { input: "0", expected: "0" },
      { input: "1", expected: "01" },
      { input: "0", expected: "010" },
      { input: "1", expected: "0101" },
      { input: "2", expected: "01012" },
      { input: "3", expected: "010123" },
      { input: "4", expected: "0101234" },
      { input: "5", expected: "01012345" },
      { input: "6", expected: "010123456" },
      { input: "7", expected: "0101234567" },
      { input: "8", expected: "01012345678" }
    ];

    it("focus 유지 시 원본값 유지", async () => {
      await runTest(koreanNumberCases, "01012345678");
    });

    it("blur 시 포맷팅 적용", async () => {
      const formattedCases = [...koreanNumberCases];
      formattedCases[9] = { input: "7", expected: "010-123-4567" };
      formattedCases[10] = { input: "8", expected: "010-1234-5678" };

      await runTest(formattedCases, "010-1234-5678", {
        ...defaultTestConfig,
        shouldTab: true
      });
    });
  });

  describe("국제 번호", () => {
    describe("중국", () => {
      const chinaCases: SequentialInputTestCase[] = [
        { input: "+", expected: "+" },
        { input: "8", expected: "+8" },
        { input: "6", expected: "+86" },
        { input: "1", expected: "+861" },
        { input: "3", expected: "+8613" },
        { input: "8", expected: "+86138" },
        { input: "9", expected: "+861389" },
        { input: "8", expected: "+8613898" },
        { input: "3", expected: "+86138983" },
        { input: "2", expected: "+861389832" },
        { input: "1", expected: "+8613898321" },
        { input: "9", expected: "+86138983219" },
        { input: "0", expected: "+861389832190" },
        { input: "0", expected: "+8613898321900" }
      ];

      it("focus 유지 시 원본값 유지", async () => {
        await runTest(chinaCases, "+8613898321900");
      });

      it("blur 시 포맷팅 적용", async () => {
        const formattedCases = [...chinaCases];
        formattedCases[13] = { input: "0", expected: "+86 138 9832 1900" };

        await runTest(formattedCases, "+86 138 9832 1900", {
          ...defaultTestConfig,
          shouldTab: true
        });
      });
    });

    describe("미국", () => {
      const usCases: SequentialInputTestCase[] = [
        { input: "+", expected: "+" },
        { input: "1", expected: "+1" },
        { input: "2", expected: "+12" },
        { input: "3", expected: "+123" },
        { input: "4", expected: "+1234" },
        { input: "5", expected: "+12345" },
        { input: "6", expected: "+123456" },
        { input: "7", expected: "+1234567" },
        { input: "8", expected: "+12345678" },
        { input: "9", expected: "+123456789" },
        { input: "0", expected: "+1234567890" },
        { input: "0", expected: "+12345678900" }
      ];

      it("focus 유지 시 원본값 유지", async () => {
        await runTest(usCases, "+12345678900");
      });

      it("blur 시 포맷팅 적용", async () => {
        const formattedCases = [...usCases];
        formattedCases[11] = { input: "0", expected: "+1 234 567 8900" };

        await runTest(formattedCases, "+1 234 567 8900", {
          ...defaultTestConfig,
          shouldTab: true
        });
      });
    });

    describe("한국", () => {
      const internationalKoreanCases: SequentialInputTestCase[] = [
        { input: "+", expected: "+" },
        { input: "8", expected: "+8" },
        { input: "2", expected: "+82" },
        { input: "1", expected: "+821" },
        { input: "0", expected: "+8210" },
        { input: "1", expected: "+82101" },
        { input: "2", expected: "+821012" },
        { input: "3", expected: "+8210123" },
        { input: "4", expected: "+82101234" },
        { input: "5", expected: "+821012345" },
        { input: "6", expected: "+8210123456" },
        { input: "7", expected: "+82101234567" },
        { input: "8", expected: "+821012345678" }
      ];

      it("focus 유지 시 원본값 유지", async () => {
        await runTest(internationalKoreanCases, "+821012345678");
      });

      it("blur 시 국내 번호 포맷으로 변환", async () => {
        const formattedCases = [...internationalKoreanCases];
        formattedCases[11] = { input: "7", expected: "010-123-4567" };
        formattedCases[12] = { input: "8", expected: "010-1234-5678" };

        await runTest(formattedCases, "010-1234-5678", {
          ...defaultTestConfig,
          shouldTab: true
        });
      });
    });
  });

  describe("잘못된 입력 처리", () => {
    it("문자만 입력 시 무시", async () => {
      await runTest([{ input: "abc", expected: "" }], "", {
        ...defaultTestConfig,
        shouldTab: true
      });
    });

    it("문자와 숫자 혼합 시 숫자만 처리", async () => {
      await runTest([{ input: "010abc123", expected: "010123" }], "010123", {
        ...defaultTestConfig,
        shouldTab: true
      });
    });
  });

  describe("validation check", () => {
    it("6글자 이하면 isInvalid true로 설정되어야 함", async () => {
      const { getByRole } = render(
        <TestComponent
          initialPhoneNumber="010123"
          mockOnChangeSave={jest.fn()}
        />
      );

      const input = getByRole("textbox");
      expect(input).toHaveAttribute("data-invalid", "true");
    });

    it("7글자 이상이면면 isInvalid false로 설정되어야 함", async () => {
      const { getByRole } = render(
        <TestComponent
          initialPhoneNumber="0101235"
          mockOnChangeSave={jest.fn()}
        />
      );

      const input = getByRole("textbox");
      expect(input).toHaveAttribute("data-invalid", "false");
    });
  });
});
