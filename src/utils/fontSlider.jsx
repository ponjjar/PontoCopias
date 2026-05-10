import { useState, useEffect } from "react";

const FontSlider = () => {
  const [selectedSize, setSelectedSize] = useState("normal");
  const [isExpanded, setIsExpanded] = useState(false); // New state for expansion
  const [initialFontSizes, setInitialFontSizes] = useState(new Map());

  useEffect(() => {
    let scale = 1;
    switch (selectedSize) {
      case "pequeno": scale = 0.85; break;
      case "normal": scale = 1; break;
      case "grande": scale = 1.15; break;
      case "extra-grande": scale = 1.3; break;
      case "gigante": scale = 1.45; break;
      default: scale = 1;
    }
    
    document.documentElement.style.zoom = scale;
    
    return () => { document.documentElement.style.zoom = 1; };
  }, [selectedSize]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExpanded && !event.target.closest('.font-slider-container')) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

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
    <div className="font-slider-container" style={{ position: "relative" }}>
      <button
        title="Ajustar tamanho da fonte"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          color: "#fff",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          transition: "all 0.3s",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          boxSizing: 'border-box'
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)"; }}
        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"; }}
      >
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Aa</span>
      </button>

      {isExpanded && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: "0",
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
            padding: "16px 24px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: "250px"
          }}
        >
          <label
            htmlFor="font-size-controls"
            style={{ fontWeight: "bold", color: "#2c3e50", marginBottom: "16px", fontSize: '16px' }}
          >
            Ajustar tamanho da fonte
          </label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={handleDecreaseFontSize}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#f1f3f5",
                color: "#2c3e50",
                cursor: "pointer",
                fontSize: "20px",
                fontWeight: "bold",
                marginRight: "12px",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "#e2e6ea"}
              onMouseOut={(e) => e.target.style.background = "#f1f3f5"}
            >
              -
            </button>
            <select
              style={{
                fontSize: "16px",
                color: "#2c3e50",
                minWidth: "120px",
                textAlign: "center",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #ced4da",
                backgroundColor: "#fff",
                cursor: "pointer",
                appearance: "none",
                outline: 'none'
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
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#f1f3f5",
                color: "#2c3e50",
                cursor: "pointer",
                fontSize: "20px",
                fontWeight: "bold",
                marginLeft: "12px",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "#e2e6ea"}
              onMouseOut={(e) => e.target.style.background = "#f1f3f5"}
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
