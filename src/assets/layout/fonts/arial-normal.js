﻿import { jsPDF } from "jspdf";

let font =
let callAddFont = function () {
  this.addFileToVFS("arial-normal.ttf", font);
  this.addFont("arial-normal.ttf", "arial", "normal");
};
jsPDF.API.events.push(["addFonts", callAddFont]);