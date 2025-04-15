document
  .getElementById("bisectionForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const funcInput = document.getElementById("func").value;
    const aInput = parseFloat(document.getElementById("a").value);
    const bInput = parseFloat(document.getElementById("b").value);
    const tol = parseFloat(document.getElementById("tolerance").value);
    const MX_IT = 50;

    document.getElementById("explanation").innerHTML = `
      <div class="text-center my-4">
        <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
        <p class="mt-2">Calculating...</p>
      </div>
    `;

    setTimeout(() => {
      calculateBisection(funcInput, aInput, bInput, tol, MX_IT);
    }, 2000);
  });

function calculateBisection(funcInput, aInput, bInput, tol, MX_IT) {
  const preprocessMathExpression = (expr) => {
    return expr
      .replace(/(\d*)x\^(\d+)/g, (_, a, b) => `${a || 1}*Math.pow(x,${b})`)
      .replace(/x\^(\d+)/g, "Math.pow(x,$1)")
      .replace(/(\W|^)ln\(/g, "$1Math.log(")
      .replace(/(\W|^)log\(/g, "$1Math.log10(")
      .replace(/(\W|^)sin\(/g, "$1Math.sin(")
      .replace(/(\W|^)cos\(/g, "$1Math.cos(")
      .replace(/(\W|^)tan\(/g, "$1Math.tan(")
      .replace(/(\W|^)sqrt\(/g, "$1Math.sqrt(");
  };

  const f = (x) => {
    try {
      const parsedExpr = preprocessMathExpression(funcInput);
      return eval(parsedExpr.replace(/x/g, `(${x})`));
    } catch (err) {
      console.error("Evaluation error:", err);
      return NaN;
    }
  };

  const formatNumber = (x) => parseFloat(x.toFixed(6)).toString();

  let a = aInput;
  let b = bInput;
  let explanationHTML = "";
  let stepsHTML = "";
  let iteration = 0;
  let p, fp;

  const fa = f(a);
  const fb = f(b);

  if (isNaN(fa) || isNaN(fb)) {
    showAlert("error", "Invalid function or inputs.");
    return;
  }

  if (fa * fb > 0) {
    showAlert(
      "warning",
      "Function must have opposite signs at a and b. Please check your inputs."
    );
    return;
  }

  explanationHTML += `
    <div class="card shadow mb-4">
      <div class="card-header bg-light">
        <div class="d-flex align-items-center">
          <i class="fas fa-chart-line result-icon"></i>
          <h4 class="mb-0">Function Analysis</h4>
        </div>
      </div>
      <div class="card-body">
        <div class="alert alert-info">
          <i class="fas fa-info-circle me-2"></i>
          Solving for roots of <strong>f(x) = ${funcInput}</strong> in the interval [${formatNumber(a)}, ${formatNumber(b)}]
        </div>
        <div class="row">
          <div class="col-md-6">
            <p><i class="fas fa-arrow-left text-primary me-2"></i>f(${formatNumber(a)}) = ${formatNumber(fa)}</p>
          </div>
          <div class="col-md-6">
            <p><i class="fas fa-arrow-right text-primary me-2"></i>f(${formatNumber(b)}) = ${formatNumber(fb)}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  explanationHTML += `
    <div class="card shadow mb-4">
      <div class="card-header bg-light">
        <div class="d-flex align-items-center">
          <i class="fas fa-calculator result-icon"></i>
          <h4 class="mb-0">Calculation Steps</h4>
        </div>
      </div>
      <div class="card-body">
  `;

  do {
    let oldA = a;
    let oldB = b;
    let fa = f(oldA);
    let fb = f(oldB);

    p = (oldA + oldB) / 2;
    fp = f(p);

    let updateStep = "";
    let updateIcon = "";

    if (fa * fp < 0) {
      b = p;
      updateStep = "b = p";
      updateIcon = '<i class="fas fa-arrow-left text-primary"></i>';
    } else {
      a = p;
      updateStep = "a = p";
      updateIcon = '<i class="fas fa-arrow-right text-primary"></i>';
    }

    iteration++;

    explanationHTML += `
      <div class="math-step">
        <div class="d-flex align-items-center mb-2 text-primary border-bottom pb-2">
          <h3>${iteration}<sup>${st_nd_rd_th_check(
      iteration
    )}</sup> iteration:</h3>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="math"><i class="fas fa-arrow-left text-muted me-1"></i> f(${formatNumber(oldA)}) = ${formatNumber(fa)}</div>
          </div>
          <div class="col-md-6">
            <div class="math"><i class="fas fa-arrow-right text-muted me-1"></i> f(${formatNumber(oldB)}) = ${formatNumber(fb)}</div>
          </div>
        </div>
        <div class="math"><i class="fas fa-route text-muted me-1"></i> Root lies between ${formatNumber(oldA)} and ${formatNumber(oldB)}</div>
        <div class="math mt-2">
          <i class="fas fa-crosshairs text-primary me-1"></i> x<sub>${
            iteration - 1
          }</sub> = 
          <span class="fraction">
            <span class="top">${formatNumber(oldA)} + ${formatNumber(oldB)}</span>
            <span class="bottom">2</span>
          </span> = ${formatNumber(p)}
        </div>
        <div class="math"><i class="fas fa-equals text-primary me-1"></i> f(x<sub>${
          iteration - 1
        }</sub>) = f(${formatNumber(p)}) = ${formatNumber(fp)}</div>
        <div class="math">${updateIcon} ${updateStep}</div>
      </div>
    `;

    stepsHTML += `<tr class="${iteration % 2 === 0 ? "table-light" : ""}">
                    <td>${iteration}</td>
                    <td>${formatNumber(oldA)}</td>
                    <td>${formatNumber(oldB)}</td>
                    <td>${formatNumber(p)}</td>
                    <td>${formatNumber(fp)}</td>
                    <td>${updateStep}</td>
                  </tr>`;
  } while (Math.abs(b - a) / 2 > tol && iteration < MX_IT);

  explanationHTML += `</div></div>`;


  if (iteration >= MX_IT) {
    explanationHTML += `
      <div class="card shadow">
        <div class="card-body math-step border-danger">
          <div class="d-flex align-items-center">
            <i class="fas fa-exclamation-triangle text-danger fa-2x me-3"></i>
            <div>
              <div class="math"><strong>Maximum iterations reached (${MX_IT})</strong></div>
              <div class="math">The method may not have fully converged. Last approximation: <strong>${formatNumber(p)}</strong></div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    explanationHTML += `
      <div class="card shadow">
        <div class="card-body math-step border-success">
          <div class="d-flex align-items-center">
            <i class="fas fa-check-circle text-success fa-2x me-3"></i>
            <div>
              <div class="math"><strong>Approximate root found</strong></div>
              <div class="math">x ≈ <strong>${formatNumber(p)}</strong> with tolerance <strong>${tol}</strong></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  document.getElementById("resultContainer").classList.remove("d-none");
  document.getElementById("explanation").innerHTML = explanationHTML;
  document.getElementById("stepsTable").innerHTML = stepsHTML;
}

function showAlert(type, message) {
  const alertClass = type === "error" ? "danger" : type;
  const icon =
    type === "error"
      ? "exclamation-circle"
      : type === "warning"
      ? "exclamation-triangle"
      : "info-circle";

  document.getElementById("explanation").innerHTML = `
    <div class="alert alert-${alertClass} d-flex align-items-center" role="alert">
      <i class="fas fa-${icon} me-2"></i>
      <div>${message}</div>
    </div>
  `;
  document.getElementById("stepsTable").innerHTML = "";
}

function st_nd_rd_th_check(n) {
  switch (n) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
