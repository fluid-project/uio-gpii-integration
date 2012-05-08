MyInfusion was built from an unreleased version of Infusion (2e5d1e38dcbf6dc7bb23f7f13793c418a0b3d7b7), 
cindyli branch FLUID-1653 (https://github.com/cindyli/infusion/tree/FLUID-1653) using the following command:

Build the minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino

Build the un-minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino -DnoMinify="true"
