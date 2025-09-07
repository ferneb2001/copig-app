procedure clasi1
* Clasifica  archivo de profesionales
wsigue='S'
contii='s'
set delete on
wnumero=0
close all
set exclusive on
*set multilocks on
wcatego=space(2)
wnom=space(30)
@04,01 clear to 23,78
@04,25 say 'CLASIFICACION DE ARCHIVOS 1'
select 1
use spprof index spprof, spprofn
reindex 
select 2
use spmatri index spmatri, spmatdo
reindex
use spmatrie index spmatrie, spmatdoe
reindex
use spprofe index spprofe, spprofen, spprofeb
reindex
@04,01 clear to 23,78
close all
return