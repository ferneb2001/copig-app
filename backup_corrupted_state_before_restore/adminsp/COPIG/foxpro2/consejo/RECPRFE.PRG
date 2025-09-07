procedure RECPRFE
*recupera spprofe y spmatrie de svprofy svmatri
*      con titulos auxiliares (otros titulos)
@04,01 clear to 23,78
@04,28 say 'RECUPERA PROFESIONALES DE BAJA'
set exclusive off
select 1
use spmatrie index spmatrie.idx, spmatdoe.idx
select 2
use spprofe index spprofe.idx, spprofen.idx
select 3
set safety off
set date to dmy
set century on
use svprofe index svprofe.idx, svprofen.idx
select 4
use svmatrie index svmatrie.idx, svmatdoe.idx
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
	     wkey=str(wmatri,5)+'EM'
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
*            replace vtohab with d.vtohab
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
            replace local  with c.local
            replace estciv with c.estciv
            replace nacion with c.nacion
            replace fallec with c.fallec
            replace estado with c.estado
            replace domleg with c.domleg
            replace ecelular with c.ecelular
*            replace numasoc with c.numasoc
            replace erubro  with c.erubro
            replace emcpost with c.emcpost
            replace eemail with c.eemail
            replace emcpos1 with c.emcpos1
            replace emcpos2 with c.emcpos2
            replace efax   with c.efax
            replace edomlg with c.edomlg
            replace eprovlg with c.eprovlg
            replace edptolg with c.edptolg
            replace elocalg  with c.elocalg
            replace etellg  with c.etellg
            replace ecpos1lg with c.ecpos1lg
            replace ecposlg with c.ecposlg
            replace ecpos2lg with c.ecpos2lg
            replace eemailg with c.eemailg
            replace efaxlg  with c.efaxlg
            replace ecellg  with c.ecellg
            replace etipolg with c.etipolg
* endif
return
