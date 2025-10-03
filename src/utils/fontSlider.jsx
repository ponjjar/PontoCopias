import { useState, useEffect } from "react";

const FontSlider = () => {
  const [selectedSize, setSelectedSize] = useState("normal");
  const [isExpanded, setIsExpanded] = useState(false); // New state for expansion
  const [initialFontSizes, setInitialFontSizes] = useState(new Map());

  useEffect(() => {
    const elements = document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, span, div, label, input, textarea, button, select"
    );

    if (initialFontSizes.size === 0) {
      const initialSizes = new Map();
      elements.forEach((element, index) => {
        initialSizes.set(
          element,
          parseFloat(window.getComputedStyle(element).fontSize)
        );
      });
      setInitialFontSizes(initialSizes);
    }

    elements.forEach((element) => {
      const initialFontSize = initialFontSizes.get(element);
      if (initialFontSize === undefined) return; // Should not happen if initialFontSizes is populated correctly

      let newFontSize = initialFontSize;

      switch (selectedSize) {
        case "pequeno":
          newFontSize = initialFontSize - 4; // Subtract 4px from the original size
          break;
        case "normal":
          newFontSize = initialFontSize; // Reset to original size
          break;
        case "grande":
          newFontSize = initialFontSize + 4; // Add 4px to the original size
          break;
        case "extra-grande":
          newFontSize = initialFontSize + 8; // Add 8px to the original size
          break;
        case "gigante":
          newFontSize = initialFontSize + 12; // Add 8px to the original size
          break;
        default:
          newFontSize = initialFontSize;
      }

      // Calculate the new font size based on the selected size
      element.style.fontSize = `${newFontSize}px`; // Apply the new font size
    });
  }, [selectedSize, initialFontSizes]);

  const handleIncreaseFontSize = () => {
    const sizes = ["pequeno", "normal", "grande", "extra-grande", "gigante"];
    const currentIndex = sizes.indexOf(selectedSize);
    if (currentIndex < sizes.length - 1) {
      setSelectedSize(sizes[currentIndex + 1]);
    }
  };

  const handleDecreaseFontSize = () => {
    const sizes = ["pequeno", "normal", "grande", "extra-grande", "gigante"];
    const currentIndex = sizes.indexOf(selectedSize);
    if (currentIndex > 0) {
      setSelectedSize(sizes[currentIndex - 1]);
    }
  };

  return (
    <div style={{ position: "relative", marginBottom: "20px" }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: "8px 15px",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#007bff",
          color: "#fff",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "bold",
          display: "block",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {isExpanded ? "Fechar Ajuste de Fonte" : "Ajustar Tamanho da Fonte"}
      </button>

      {isExpanded && (
        <div
          style={{
            position: "absolute",
            top: "100%", // Position below the button
            left: "0",
            right: "0",
            backgroundColor: "#e9ecef",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px 24px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            zIndex: 1000, // Ensure it's above other content
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "5px", // Small gap between button and expanded content
          }}
        >
          <label
            htmlFor="font-size-controls"
            style={{ fontWeight: "bold", color: "#343a40", marginBottom: "10px" }}
          >
            Tamanho da Fonte:
          </label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={handleDecreaseFontSize}
              style={{
                padding: "8px 12px",
                borderRadius: "5px",
                border: "1px solid #007bff",
                backgroundColor: "#007bff",
                color: "#fff",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                marginRight: "10px",
              }}
            >
              -
            </button>
            <select
              style={{
                fontSize: "16px",
                color: "#495057",
                minWidth: "120px",
                textAlign: "center",
                padding: "8px 12px",
                borderRadius: "5px",
                border: "1px solid #ced4da",
                backgroundColor: "#fff",
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "16px 12px",
              }}
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="pequeno">Pequeno</option>
              <option value="normal">Normal</option>
              <option value="grande">Grande</option>
              <option value="extra-grande">Extra Grande</option>
              <option value="gigante">Gigante</option>
            </select>
            <button
              onClick={handleIncreaseFontSize}
              style={{
                padding: "8px 12px",
                borderRadius: "5px",
                border: "1px solid #007bff",
                backgroundColor: "#007bff",
                color: "#fff",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                marginLeft: "10px",
              }}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontSlider;
