procedure TRFPRF5
*genera spprof y spmatri sacando prof
*      con titulos auxiliares (otros titulos)
*      bajas al 23-01-2015
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
set exclusive off
select 2
use saprof index saprof.idx
select 3
set safety off
set date to dmy
set century on
use s1prof index s1prof.idx, s1profn.idx
select 4
use s1matri index s1matri, s1matdo.idx
select 6
use s2prof index s2prof.idx, s2profn.idx
select 5
use s2matri index s2matri, s2matdo.idx
whabi=' '
wop=3
wnomtit=space(30)
@08,02 say 'Clases'
@10,02 get wop pict '@*RVT \<Habilitados;\<No habilitados;\<Todos';
       color scheme 5
read
@23,01 clear to 23,78
   whabi=' '
   wop=1
   wcatego='  '
   wop=1
   wtitulo=space(3)
   wnomtit=space(30)
   wop=1
   wdpto=0
   wnomdpto=space(15)
   wopdoc=1
   @23,01 clear to 23,78
   wop=1
   @23,30 get wop pict '@*H \<Salir;\<grabar'
   read
   if wop=2   
   	  @18,01 say 'Leido:'
   	  @19,01 say 'Seleccionado:'                
      select 1
      use samatri
      go top
      set clock on
      @14,21 to 16,62
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         @18,18 say numero
         if wcatego='  ' or catego=wcatego
                  if habili>= 2010
                    do arma1
                  else
                  	if condic='2' or condic='6'
                  		do arma1
                  	else
                  		do arma
                  	endif		  
                  endif  
         endif
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
  endif   
@04,01 clear to 23,78
close all
return

procedure arma
   select 2
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
            @18,25 say nombre
            @19,18 say a.numero
            @19,25 say b.nombre
            select 4
            append blank
            replace numero with a.numero
            replace catego with a.catego
            replace titulo with a.titulo
            replace habili with a.habili
            replace condic with a.condic
            replace dctipo with a.dctipo
            replace dcnro  with a.dcnro
            replace otorga with a.otorga
            replace inscr  with a.inscr
            replace fectit with a.fectit
            replace fechab with a.fechab
            replace feccert with a.feccert
            replace pago   with a.pago
            replace recibo with a.recibo
            replace afilia with a.afilia
            replace vtohab with a.vtohab
            select 3
            append blank
            replace dctipo with b.dctipo
            replace dcnro  with b.dcnro
            replace nombre with b.nombre
            replace domici with b.domici
            replace tipo   with b.tipo
            replace provin with b.provin
            replace dpto   with b.dpto
            replace locali with b.locali
            replace telef  with b.telef
            replace nacio  with b.nacio
            replace cuit   with b.cuit
            replace sexo   with b.sexo
            replace estciv with b.estciv
            replace nacion with b.nacion
            replace fallec with b.fallec
            replace estado with b.estado
            replace domleg with b.domleg
            replace celular with b.celular
            replace numasoc with b.numasoc
            replace feasoc  with b.feasoc
            replace spcpos  with b.spcpos
            replace spemail with b.spemail
            replace spcpos1 with b.spcpos1
            replace spcpos2 with b.spcpos2
            replace spfax   with b.spfax
            replace spdomlg with b.spdomlg
            replace spprovlg with b.spprovlg
            replace spdptolg with b.spdptolg
            replace sploclg  with b.sploclg
            replace sptellg  with b.sptellg
            replace spcpos1g with b.spcpos1g
            replace spcposlg with b.spcposlg
            replace spcpos2g with b.spcpos2g
            replace spemailg with b.spemailg
            replace spfaxlg  with b.spfaxlg
            replace spcellg  with b.spcellg
            replace sptipolg with b.sptipolg
            replace vdom     with b.vdom
            replace vprov    with b.vprov
            replace vdpto    with b.vdpto
            replace vlocal   with b.vlocal
            replace vcpos    with b.vcpos
            replace vtelef   with b.vtelef
            replace vcelu    with b.vcelu
            replace vmail    with b.vmail
            replace vfecha   with b.vfecha
            replace vsubfa   with b.vsubfa
            replace vsubfe   with b.vsubfe
   endif
return


   
procedure arma1
   select 2
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
            @18,25 say nombre
            @19,18 say a.numero
            @19,25 say b.nombre
            select 5
            append blank
            replace numero with a.numero
            replace catego with a.catego
            replace titulo with a.titulo
            replace habili with a.habili
            replace condic with a.condic
            replace dctipo with a.dctipo
            replace dcnro  with a.dcnro
            replace otorga with a.otorga
            replace inscr  with a.inscr
            replace fectit with a.fectit
            replace fechab with a.fechab
            replace feccert with a.feccert
            replace pago   with a.pago
            replace recibo with a.recibo
            replace afilia with a.afilia
            replace vtohab with a.vtohab
            select 6
            append blank
            replace dctipo with b.dctipo
            replace dcnro  with b.dcnro
            replace nombre with b.nombre
            replace domici with b.domici
            replace tipo   with b.tipo
            replace provin with b.provin
            replace dpto   with b.dpto
            replace locali with b.locali
            replace telef  with b.telef
            replace nacio  with b.nacio
            replace cuit   with b.cuit
            replace sexo   with b.sexo
            replace estciv with b.estciv
            replace nacion with b.nacion
            replace fallec with b.fallec
            replace estado with b.estado
            replace domleg with b.domleg
            replace celular with b.celular
            replace numasoc with b.numasoc
            replace feasoc  with b.feasoc
            replace spcpos  with b.spcpos
            replace spemail with b.spemail
            replace spcpos1 with b.spcpos1
            replace spcpos2 with b.spcpos2
            replace spfax   with b.spfax
            replace spdomlg with b.spdomlg
            replace spprovlg with b.spprovlg
            replace spdptolg with b.spdptolg
            replace sploclg  with b.sploclg
            replace sptellg  with b.sptellg
            replace spcpos1g with b.spcpos1g
            replace spcposlg with b.spcposlg
            replace spcpos2g with b.spcpos2g
            replace spemailg with b.spemailg
            replace spfaxlg  with b.spfaxlg
            replace spcellg  with b.spcellg
            replace sptipolg with b.sptipolg
            replace vdom     with b.vdom
            replace vprov    with b.vprov
            replace vdpto    with b.vdpto
            replace vlocal   with b.vlocal
            replace vcpos    with b.vcpos
            replace vtelef   with b.vtelef
            replace vcelu    with b.vcelu
            replace vmail    with b.vmail
            replace vfecha   with b.vfecha
            replace vsubfa   with b.vsubfa
            replace vsubfe   with b.vsubfe
   endif
return
