MyInfusion was built from an unreleased version of Infusion (9346ce5eae1cba1b6df9c02a6a1d48ed1a581ddd), 
cindyli branch FLUID-1653 (https://github.com/cindyli/infusion/tree/FLUID-1653) using the following command:

Build the minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino

Build the un-minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino -DnoMinify="true"
