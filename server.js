import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";


/*
====================================================
CẤU HÌNH SERVER
====================================================
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3000;

const MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-3.5-flash";


/*
====================================================
GEMINI CLIENT
====================================================
*/

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

const ai = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY
    })
  : null;


/*
====================================================
MIDDLEWARE
====================================================
*/

app.use(
  express.json({
    limit: "32kb"
  })
);

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);


/*
====================================================
SYSTEM INSTRUCTION
====================================================

Đây là phần định hình AI thành
CHUYÊN GIA HÓA HỌC.
*/

const SYSTEM_INSTRUCTION = `

Bạn là một CHUYÊN GIA HÓA HỌC và là giáo viên
Hóa học có kinh nghiệm chuyên sâu về:

- Cân bằng phương trình hóa học.
- Phương pháp đại số.
- Phương pháp electron.
- Phương pháp oxi hóa - khử.
- Phương pháp ion-electron.
- Phản ứng trong môi trường axit, bazơ và trung tính.
- Phản ứng vô cơ phổ biến.
- Phản ứng hữu cơ cơ bản.
- Điều kiện phản ứng hóa học.

NHIỆM VỤ CHÍNH:

Người dùng sẽ cung cấp một phương trình hóa học
chưa cân bằng.

Hãy phân tích phương trình và đưa ra kết quả
chính xác, dễ hiểu để hiển thị trên website.

====================================================
QUY TẮC HÓA HỌC BẮT BUỘC
====================================================

1. TUYỆT ĐỐI KHÔNG được tự ý thay đổi công thức
   hóa học của chất mà người dùng đã nhập.

Ví dụ:

H2O không được tự đổi thành H2O2.

FeCl2 không được tự đổi thành FeCl3.

2. Không tự ý thêm chất mới nếu đề bài không cung cấp
   hoặc không có cơ sở hóa học rõ ràng.

3. Phải xác định chính xác tất cả nguyên tố
   xuất hiện trong phương trình.

4. Phải tìm hệ số nguyên dương tối giản.

Ví dụ:

2H2 + O2 → 2H2O

không trả về:

4H2 + 2O2 → 4H2O

5. Sau khi cân bằng phải kiểm tra lại số nguyên tử
   của TẤT CẢ các nguyên tố ở hai vế.

6. Nếu là phương trình ion hoặc ion rút gọn,
   phải kiểm tra cả điện tích hai vế.

7. Nếu là phản ứng oxi hóa - khử:

   - Xác định số oxi hóa.
   - Xác định nguyên tố bị oxi hóa.
   - Xác định nguyên tố bị khử.
   - Xác định chất khử.
   - Xác định chất oxi hóa.
   - Viết quá trình nhường electron.
   - Viết quá trình nhận electron.
   - Cân bằng electron.
   - Tìm hệ số.
   - Cân bằng các nguyên tố còn lại.
   - Kiểm tra lại toàn bộ phương trình.

8. Nếu không phải phản ứng oxi hóa - khử,
   sử dụng phương pháp phù hợp như:

   - Phương pháp đại số.
   - Bảo toàn nguyên tố.
   - Bảo toàn điện tích đối với phương trình ion.
   - Phương pháp phù hợp khác.

9. Nếu phương trình có điều kiện phản ứng
   thường gặp và có cơ sở chắc chắn, hãy ghi điều kiện
   như:

   - nhiệt độ
   - đun nóng
   - xúc tác
   - ánh sáng
   - điện phân
   - môi trường axit
   - môi trường bazơ

   Không được bịa điều kiện.

10. Nếu không xác định được điều kiện phản ứng,
    ghi rõ:

    "Không xác định điều kiện từ dữ kiện đã cho."

11. Nếu phương trình không hợp lệ, thiếu chất,
    công thức không rõ ràng hoặc không thể cân bằng
    một cách hợp lý:

    - verified = false
    - balanced_equation = ""
    - warning phải giải thích rõ nguyên nhân.

12. Chỉ đặt verified = true khi đã kiểm tra lại
    phương trình.

13. Không được đoán hệ số.

14. Không được trả về Markdown.

15. Nội dung text phải bằng tiếng Việt.

16. Nội dung phải dễ hiển thị trực tiếp trên giao diện
    website.

====================================================
ĐỊNH DẠNG KẾT QUẢ
====================================================

balanced_equation:

Chứa phương trình đã cân bằng.

Ví dụ:

2H2 + O2 → 2H2O

products:

Chứa tên/công thức các chất sản phẩm.

Ví dụ:

2H2O (nước)

conditions:

Chứa điều kiện phản ứng nếu có.

Ví dụ:

Đun nóng

Nếu không có điều kiện rõ ràng:

Không xác định điều kiện từ dữ kiện đã cho.

method:

Ghi phương pháp đã sử dụng.

Ví dụ:

Phương pháp thăng bằng electron.

steps_text:

Viết lời giải theo dạng văn bản đơn giản,
dễ đọc trên website.

Ví dụ:

Bước 1: Xác định số oxi hóa...

Bước 2: Xác định quá trình oxi hóa...

Bước 3: Xác định quá trình khử...

Bước 4: Cân bằng electron...

Bước 5: Đặt hệ số vào phương trình...

Bước 6: Kiểm tra lại số nguyên tử...

verification:

Mô tả ngắn gọn việc kiểm tra phương trình.

warning:

Nếu có cảnh báo thì ghi rõ.
Nếu không có cảnh báo thì để chuỗi rỗng.

====================================================
YÊU CẦU QUAN TRỌNG NHẤT
====================================================

TÍNH ĐÚNG ĐẮN CỦA PHƯƠNG TRÌNH QUAN TRỌNG HƠN
VIỆC TRẢ LỜI NHANH.

Luôn kiểm tra:

- Công thức hóa học.
- Số nguyên tử mỗi nguyên tố.
- Điện tích nếu là phương trình ion.
- Hệ số tối giản.
- Tính hợp lý của phản ứng.
- Điều kiện phản ứng nếu có.

Không được bịa dữ kiện.
`;


/*
====================================================
JSON SCHEMA
====================================================
*/

const RESULT_SCHEMA = {
  type: "object",

  properties: {

    balanced_equation: {
      type: "string"
    },

    products: {
      type: "string"
    },

    conditions: {
      type: "string"
    },

    method: {
      type: "string"
    },

    steps_text: {
      type: "string"
    },

    verification: {
      type: "string"
    },

    verified: {
      type: "boolean"
    },

    warning: {
      type: "string"
    }

  },

  required: [
    "balanced_equation",
    "products",
    "conditions",
    "method",
    "steps_text",
    "verification",
    "verified",
    "warning"
  ],

  additionalProperties: false
};


/*
====================================================
KIỂM TRA INPUT
====================================================
*/

function validateEquation(equation) {

  if (
    typeof equation !== "string"
  ) {
    return "Dữ liệu không hợp lệ.";
  }

  const text =
    equation.trim();

  if (!text) {
    return "Vui lòng nhập phương trình hóa học.";
  }

  if (text.length > 500) {
    return "Phương trình quá dài. Tối đa 500 ký tự.";
  }

  return null;
}


/*
====================================================
API KIỂM TRA SERVER
====================================================
*/

app.get(
  "/api/health",
  (req, res) => {

    res.json({
      ok: true,
      service: "Chem Balance AI",
      model: MODEL,
      gemini_configured: Boolean(
        GEMINI_API_KEY
      )
    });

  }
);


/*
====================================================
API CÂN BẰNG PHƯƠNG TRÌNH
====================================================
*/

app.post(
  "/api/balance",
  async (req, res) => {

    const equation =
      String(
        req.body?.equation ?? ""
      ).trim();


    /*
    --------------------------------------------
    Kiểm tra input
    --------------------------------------------
    */

    const validationError =
      validateEquation(equation);


    if (validationError) {

      return res.status(400).json({
        error: validationError
      });

    }


    /*
    --------------------------------------------
    Kiểm tra API key
    --------------------------------------------
    */

    if (!GEMINI_API_KEY || !ai) {

      return res.status(500).json({

        error:
          "Chưa cấu hình GEMINI_API_KEY trong file .env."

      });

    }


    try {

      /*
      ------------------------------------------
      Gửi yêu cầu tới Gemini
      ------------------------------------------
      */

      const response =
        await ai.models.generateContent({

          model: MODEL,

          contents: `
Hãy cân bằng phương trình hóa học sau:

${equation}

Chỉ phân tích phương trình được cung cấp.
Không tự ý thêm chất hoặc thay đổi công thức hóa học.
`,

          config: {

            systemInstruction:
              SYSTEM_INSTRUCTION,

            responseMimeType:
              "application/json",

            responseSchema:
              RESULT_SCHEMA,

            temperature: 0.1,

            maxOutputTokens: 3000

          }

        });


      /*
      ------------------------------------------
      Lấy kết quả
      ------------------------------------------
      */

      const output =
        response.text;


      if (!output) {

        throw new Error(
          "Gemini không trả về dữ liệu."
        );

      }


      /*
      ------------------------------------------
      Parse JSON
      ------------------------------------------
      */

      let result;

      try {

        result =
          JSON.parse(output);

      } catch (parseError) {

        console.error(
          "JSON PARSE ERROR:",
          parseError
        );

        console.error(
          "GEMINI OUTPUT:",
          output
        );

        return res.status(500).json({

          error:
            "Gemini trả về dữ liệu không đúng định dạng."

        });

      }


      /*
      ------------------------------------------
      Đảm bảo các trường tồn tại
      ------------------------------------------
      */

      result =
        normalizeResult(result);


      /*
      ------------------------------------------
      Trả kết quả
      ------------------------------------------
      */

      return res.json(result);

    }


    /*
    --------------------------------------------
    Xử lý lỗi Gemini
    --------------------------------------------
    */

    catch (error) {

      console.error(
        "GEMINI ERROR:",
        error
      );


      let message =
        "Không thể xử lý phương trình lúc này.";


      if (
        error?.message
          ?.toLowerCase()
          ?.includes("api key")
      ) {

        message =
          "Gemini API key không hợp lệ hoặc chưa được cấu hình.";

      }


      if (
        error?.message
          ?.toLowerCase()
          ?.includes("quota")
      ) {

        message =
          "Gemini API đã đạt giới hạn sử dụng. Vui lòng thử lại sau.";

      }


      return res.status(500).json({

        error: message,

        detail:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined

      });

    }

  }
);


/*
====================================================
CHUẨN HÓA KẾT QUẢ
====================================================
*/

function normalizeResult(result) {

  return {

    balanced_equation:
      typeof result.balanced_equation === "string"
        ? result.balanced_equation.trim()
        : "",

    products:
      typeof result.products === "string"
        ? result.products.trim()
        : "",

    conditions:
      typeof result.conditions === "string"
        ? result.conditions.trim()
        : "Không xác định điều kiện từ dữ kiện đã cho.",

    method:
      typeof result.method === "string"
        ? result.method.trim()
        : "",

    steps_text:
      typeof result.steps_text === "string"
        ? result.steps_text.trim()
        : "",

    verification:
      typeof result.verification === "string"
        ? result.verification.trim()
        : "",

    verified:
      result.verified === true,

    warning:
      typeof result.warning === "string"
        ? result.warning.trim()
        : ""

  };

}


/*
====================================================
KHỞI ĐỘNG SERVER
====================================================
*/

app.listen(
  PORT,
  () => {

    console.log("");
    console.log(
      "=========================================="
    );

    console.log(
      " CHEM BALANCE AI"
    );

    console.log(
      "=========================================="
    );

    console.log(
      `Server: http://localhost:${PORT}`
    );

    console.log(
      `Model: ${MODEL}`
    );

    console.log(
      `Gemini API: ${
        GEMINI_API_KEY
          ? "Đã cấu hình"
          : "CHƯA CẤU HÌNH"
      }`
    );

    console.log(
      "=========================================="
    );

    console.log("");

  }
);
