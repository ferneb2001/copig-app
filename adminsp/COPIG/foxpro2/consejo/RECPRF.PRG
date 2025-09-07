procedure RECPRF
*recupera spprof y spmatri de svprofy svmatri
*      con titulos auxiliares (otros titulos)
@04,01 clear to 23,78
@04,28 say 'RECUPERA PROFESIONALES DE BAJA'
set exclusive off
select 1
use spmatri index spmatri.idx, spmatdo.idx
select 2
use spprof index spprof.idx, spprofn.idx
select 3
set safety off
set date to dmy
set century on
use svprof index svprof.idx, svprofn.idx
select 4
use svmatri index svmatri.idx, svmatdo.idx
whabi=' '
wop=3
wnomtit=space(30)
*@08,02 say 'Clases'
*@10,02 get wop pict '@*RVT \<Habilitados;\<No habilitados;\<Todos';
*       color scheme 5
*read
@23,01 clear to 23,78
*if wop<>1
*   if wop=1
*      whabi='S'
*   else
*      if wop=2
*         whabi='N'
*      else
         whabi=' '
*      endif      
*   endif      
   wop=1
   wcatego='  '
   wtitulo=space(3)
   wnomtit=space(30)
   wdpto=0
   wnomdpto=space(15)
   wopdoc=1
   @23,01 clear to 23,78
   wop=1
*   @23,30 get wop pict '@*H \<Salir;\<grabar'
*   read
*   if wop=2
	wmatri=0
	wrecu=' '
	do while wmatri<>99999   
   	  @8,01 say 'Matricula:'
*   	  @19,01 say 'Seleccionado:'                
	  @8, 13 get wmatri pict '99999'
	  read
	  if wmatri<>99999
	     wkey=str(wmatri,5)+'A '
         select 4
         seek(wkey)
         if found()
         	wkey1=str(dctipo,1)+str(dcnro,8)
         	select 3
         	seek(wkey1)
         	if found()
         		@9,5 say nombre
         		@10,5 say d.numero
         		@18,1 say 'Recupera? s/n'
         		@18,15 get wrecu
         		read
         		if wrecu = 'S' or wrecu = 's'
         			do arma
         		endif
         	endif
         else
         	@23,1 say 'no existe matricula'
         	@23,70 get wop pict '9'
         	read
         endif			
     endif
 enddo
@04,01 clear to 23,78
close all
return

procedure arma
   select 1
            append blank
            replace numero with d.numero
            replace catego with d.catego
            replace titulo with d.titulo
            replace habili with d.habili
            replace condic with d.condic
            replace dctipo with d.dctipo
            replace dcnro  with d.dcnro
            replace otorga with d.otorga
            replace inscr  with d.inscr
            replace fectit with d.fectit
            replace fechab with d.fechab
            replace feccert with d.feccert
            replace pago   with d.pago
            replace recibo with d.recibo
            replace afilia with d.afilia
            replace vtohab with d.vtohab
            select 2
            append blank
            replace dctipo with c.dctipo
            replace dcnro  with c.dcnro
            replace nombre with c.nombre
            replace domici with c.domici
            replace tipo   with c.tipo
            replace provin with c.provin
            replace dpto   with c.dpto
            replace locali with c.locali
            replace telef  with c.telef
            replace nacio  with c.nacio
            replace cuit   with c.cuit
            replace sexo   with c.sexo
            replace estciv with c.estciv
            replace nacion with c.nacion
            replace fallec with c.fallec
            replace estado with c.estado
            replace domleg with c.domleg
            replace celular with c.celular
            replace numasoc with c.numasoc
            replace feasoc  with c.feasoc
            replace spcpos  with c.spcpos
            replace spemail with c.spemail
            replace spcpos1 with c.spcpos1
            replace spcpos2 with c.spcpos2
            replace spfax   with c.spfax
            replace spdomlg with c.spdomlg
            replace spprovlg with c.spprovlg
            replace spdptolg with c.spdptolg
            replace sploclg  with c.sploclg
            replace sptellg  with c.sptellg
            replace spcpos1g with c.spcpos1g
            replace spcposlg with c.spcposlg
            replace spcpos2g with c.spcpos2g
            replace spemailg with c.spemailg
            replace spfaxlg  with c.spfaxlg
            replace spcellg  with c.spcellg
            replace sptipolg with c.sptipolg
* endif
return
