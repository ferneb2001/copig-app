procedure TRFemp
*genera spprofe y spmatrie sacando emp
*      con titulos auxiliares (otros titulos)
@04,01 clear to 23,78
@04,28 say 'separa empresas ante 2005'
set exclusive off
select 2
use saprofe index saprofe.idx
select 3
set safety off
set date to dmy
set century on
use svprofe index svprofe.idx, svprofen.idx
select 4
use svmatrie index svmatrie.idx, svmatdoe.idx
select 6
use spprofe index spprofe.idx, spprofen.idx
select 5
use spmatrie index spmatrie, spmatdoe.idx
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
      use samatrie
      go top
      set clock on
      @14,21 to 16,62
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         @18,18 say numero
*         if wcatego='  ' or catego=wcatego
               if whabi=' '
                  if condic='2' or condic='6'
                  	do arma1
                  else	
                  	if habili<= 2005
                    	 do arma
                 	else
                  		do arma1  
                  	endif
                  endif	  
               else
               endif          
*         endif
         select 1
         skip
      enddo
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
*            replace vtohab with a.vtohab
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
            replace erubro with b.erubro
            replace estciv with b.estciv
            replace nacion with b.nacion
            replace fallec with b.fallec
            replace estado with b.estado
            replace domleg with b.domleg
            replace ecelular with b.ecelular
            replace local  with b.local
            replace emcpos1  with b.emcpos1
            replace eemail with b.eemail
            replace emcpost with b.emcpost
            replace emcpos2 with b.emcpos2
            replace efax   with b.efax
            replace edomlg with b.edomlg
            replace eprovlg with b.eprovlg
            replace edptolg with b.edptolg
            replace elocalg  with b.elocalg
            replace etellg  with b.etellg
            replace ecposlg with b.ecposlg
            replace ecpos1lg with b.ecpos1lg
            replace ecpos2lg with b.ecpos2lg
            replace eemailg with b.eemailg
            replace efaxlg  with b.efaxlg
            replace ecellg  with b.ecellg
            replace etipolg with b.etipolg
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
*            replace vtohab with a.vtohab
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
            replace erubro with b.erubro
            replace estciv with b.estciv
            replace nacion with b.nacion
            replace fallec with b.fallec
            replace estado with b.estado
            replace domleg with b.domleg
            replace ecelular with b.ecelular
            replace local  with b.local
            replace emcpos1  with b.emcpos1
            replace eemail with b.eemail
            replace emcpost with b.emcpost
            replace emcpos2 with b.emcpos2
            replace efax   with b.efax
            replace edomlg with b.edomlg
            replace eprovlg with b.eprovlg
            replace edptolg with b.edptolg
            replace elocalg  with b.elocalg
            replace etellg  with b.etellg
            replace ecposlg with b.ecposlg
            replace ecpos1lg with b.ecpos1lg
            replace ecpos2lg with b.ecpos2lg
            replace eemailg with b.eemailg
            replace efaxlg  with b.efaxlg
            replace ecellg  with b.ecellg
            replace etipolg with b.etipolg
   endif
return
