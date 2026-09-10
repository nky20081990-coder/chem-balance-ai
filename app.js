const equationInput =
  document.getElementById(
    "equation"
  );


const balanceBtn =
  document.getElementById(
    "balanceBtn"
  );


const statusEl =
  document.getElementById(
    "status"
  );


const resultEl =
  document.getElementById(
    "result"
  );


const balancedEl =
  document.getElementById(
    "balanced"
  );


const methodEl =
  document.getElementById(
    "method"
  );


const verifiedEl =
  document.getElementById(
    "verified"
  );


const warningEl =
  document.getElementById(
    "warning"
  );


const stepsEl =
  document.getElementById(
    "steps"
  );



/*
====================================================
PHƯƠNG TRÌNH MẪU
====================================================
*/

document
  .querySelectorAll(
    "[data-example]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          equationInput.value =
            button.dataset.example;

          equationInput.focus();

        }
      );

    }
  );



/*
====================================================
LOADING
====================================================
*/

function setLoading(
  loading
) {

  balanceBtn.disabled =
    loading;


  balanceBtn.textContent =
    loading
      ? "⏳ AI đang phân tích..."
      : "⚡ Cân bằng phương trình";

}



/*
====================================================
CÂN BẰNG
====================================================
*/

balanceBtn.addEventListener(
  "click",
  async () => {

    const equation =
      equationInput.value.trim();


    if (!equation) {

      statusEl.textContent =
        "Vui lòng nhập phương trình.";

      equationInput.focus();

      return;

    }


    setLoading(true);


    statusEl.textContent =
      "Đang phân tích phương trình...";


    resultEl.classList.add(
      "hidden"
    );


    try {

      const response =
        await fetch(
          "/api/balance",
          {

            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                equation:
                  equation
              })

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Có lỗi xảy ra."
        );

      }


      /*
      ------------------------------------------
      HIỂN THỊ KẾT QUẢ
      ------------------------------------------
      */

      balancedEl.textContent =
        data.balanced_equation ||
        "Không xác định";


      methodEl.textContent =
        data.method ||
        "Không xác định";


      /*
      ------------------------------------------
      TRẠNG THÁI XÁC MINH
      ------------------------------------------
      */

      if (data.verified) {

        verifiedEl.textContent =
"✓ Đã kiểm tra";

        verifiedEl.style.background =
          "#e8f8ee";

        verifiedEl.style.color =
          "#16733b";

      } else {

        verifiedEl.textContent =
          "⚠ Chưa xác minh";

        verifiedEl.style.background =
          "#fff7df";

        verifiedEl.style.color =
          "#795b00";

      }


      /*
      ------------------------------------------
      CẢNH BÁO
      ------------------------------------------
      */

      if (data.warning) {

        warningEl.textContent =
          data.warning;

        warningEl.classList.remove(
          "hidden"
        );

      } else {

        warningEl.classList.add(
          "hidden"
        );

      }


      /*
      ------------------------------------------
      CÁC BƯỚC GIẢI
      ------------------------------------------
      */

      stepsEl.textContent =
        data.steps_text ||
        "Không có lời giải.";


      /*
      ------------------------------------------
      HIỆN RESULT
      ------------------------------------------
      */

      resultEl.classList.remove(
        "hidden"
      );


      statusEl.textContent =
        "Hoàn tất.";


      resultEl.scrollIntoView({
        behavior:
          "smooth",

        block:
          "start"

      });


    } catch (error) {

      statusEl.textContent =
        error.message;

    } finally {

      setLoading(false);

    }

  }
);



/*
====================================================
CTRL + ENTER
====================================================
*/

equationInput.addEventListener(
  "keydown",
  event => {

    if (
      (event.ctrlKey ||
       event.metaKey) &&
      event.key === "Enter"
    ) {

      balanceBtn.click();

    }

  }
);
