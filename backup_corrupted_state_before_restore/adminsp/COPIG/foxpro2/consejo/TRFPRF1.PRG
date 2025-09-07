procedure TRFPRF1
*genera spprof y spmatri sacando prof
*      con titulos auxiliares (otros titulos)
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
set exclusive off
select 2
use suprof index suprof.idx
select 3
set safety off
set date to dmy
set century on
use spprof index spprof.idx, spprofn.idx
select 4
use spmatri index spmatri, spmatdo.idx
*select 6
*use spprof index spprof.idx, spprofn.idx
*select 5
*use spmatri index spmatri, spmatdo.idx
whabi=' '
wop=3
wnomtit=space(30)
@08,02 say 'Clases'
@10,02 get wop pict '@*RVT \<Habilitados;\<No habilitados;\<Todos';
       color scheme 5
read
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
      use sumatri
      go top
      set clock on
      @14,21 to 16,62
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         @18,18 say numero
         wkey=str(numero,5)+catego
         select 3
         seek(wkey)
         if found()
         else
         	do arma
         endif   
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
*      select 3
*      if wdpto=0 .and. wtitulo='   ' 
*         sort to sptempos on catego, titulo, nombre, dpto
*         do imprime
*      else   
*         if wdpto<>0 .and. wtitulo='   '
*            sort to sptempos on catego, titulo, nombre, dpto;
*            for dpto=wdpto
*            do imprime
*         else
*            if wdpto=0 .and. wtitulo<>'   '
*               sort to sptempos on catego, titulo, nombre, dpto;
*               for titulo=wtitulo
*               do imprime
*            else
*               sort to sptempos on catego, titulo, nombre, dpto;
*               for dpto=wdpto .and. titulo=wtitulo
*               do imprime
*            endif      
*         endif   
*     endif
  endif   
*endif
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
   endif
return
