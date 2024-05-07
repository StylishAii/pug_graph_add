let graph = d3.select("#graph");
let buildBtn = d3.select("#build");
let ox = d3.select("select[name='OX']");
let oy = d3.select("select[name='OY']");

const marginX = 100;
const marginY = 100;
const height = 400;
const width = 800;

let svg = d3.select("svg").attr("height", height).attr("width", width);

buildBtn.on("click", () => {
    drawGraph();
});



const createArrGraph = (selectedOX, selectedOY) => {
    const result = d3.rollups(
        filteredTableBackup,
        (v) => [
            d3.min(v, (d) => d[selectedOY]),
            d3.max(v, (d) => d[selectedOY]),
        ],
        (d) => d[selectedOX]
    );

    return Array.from(result, ([labelX, values]) => ({
        labelX,
        values
    }));
};

const drawGraph = () => {
    // значения по оси ОХ
    const selectedOX = d3.select("select[name='OX']").property("value");
    let selectedOY = d3.select("select[name='OY']").property("value");

    const isMax = d3.select("input[name='maxCheck']").property("checked");
    const isMin = d3.select("input[name='minCheck']").property("checked");

    let arrGraph = createArrGraph(selectedOX, selectedOY);
    svg.selectAll("*").remove();

    // создаем шкалы преобразования и выводим оси
    const [scX, scY] = createAxis(arrGraph, isMin, isMax);

    if (isMin) {
        createChart(arrGraph, scX, scY, 0, "blue");
    }
    if (isMax) {
        createChart(arrGraph, scX, scY, 1, "red");
    }
};

const createAxis = (arrGraph) => {
    let firstRange = d3.extent(arrGraph.map((d) => Number(d.values[0])));
    let secondRange = d3.extent(arrGraph.map((d) => Number(d.values[1])));
    let min = firstRange[0];
    let max = secondRange[1];

    let scaleX = d3
        .scaleBand()
        .domain(arrGraph.map((d) => d.labelX))
        .range([0, width - 2 * marginX]);

    let scaleY = d3
        .scaleLinear()
        .domain([min * 0.85, max * 1.1])
        .range([height - 2 * marginY, 0]);

    let axisX = d3.axisBottom(scaleX); // горизонтальная
    let axisY = d3.axisLeft(scaleY); // вертикальная

    // отрисовка осей в SVG-элементе
    svg.append("g")
        .attr("transform", `translate(${marginX}, ${height - marginY})`)
        .call(axisX)
        .selectAll("text") // подписи на оси - наклонные
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", (d) => "rotate(-45)");

    svg.append("g")
        .attr("transform", `translate(${marginX}, ${marginY})`)
        .call(axisY);

    return [scaleX, scaleY];
};

function createChart(arrGraph, scaleX, scaleY, index, color) {
    const r = 4;
    let ident = index == 0 ? -r / 2 : r / 2;

    svg.selectAll(".dot")
        .data(arrGraph)
        .enter()
        .append("circle")
        .attr("r", r)
        .attr("cx", (d) => scaleX(d.labelX) + scaleX.bandwidth() / 2)
        .attr("cy", (d) => scaleY(d.values[index]) + ident)
        .attr("transform", `translate(${marginX}, ${marginY})`)
        .style("fill", color);
}