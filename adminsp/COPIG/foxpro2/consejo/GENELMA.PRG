PROCEDURE GENELMA
* Genera archivo para La Mercantil Andina
use sptlmas 
COPY TO lma1;
	FIELDS nombre, titotorga, domici, locali, dpto, provin, telef;
	TYPE SDF
return