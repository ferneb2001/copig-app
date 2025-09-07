procedure spa92
* Actualizacion archivo de profesionales
* solo res92 y datos Inactividad
wsigue='S'
contii='s'
wnumero=0
set exclusive off
*set multilocks on
wcatego=space(2)
wnom=space(30)
westado=space(15)
wtit=0
wfincr={  /  /  }
wftit={  /  /  }
wpago={  /  /  }
wfecb=0
wfeccert={  /  /  }
wvtohab={  /  /    }
wcurso=0
wr92ini={  /  /    }
wr92act={  /  /    }
wr92vto={  /  /    }
wr92aut=0
winaini={  /  /    }
winaact={  /  /    }
winavto={  /  /    }
winaaut=0
wkey=space(7)
@04,01 clear to 23,78
@04,25 say 'ACTUALIZACION DE RES.92 E INACTIVIDAD'
do while contii='s'
do while wsigue='S'
   @05,01 clear to 23,78
   @06,02 say 'Matricula'
   @06,20 say 'Categ.:'
   do panta01
   wnumero=0
   @23,01 say 'Indique el nro.de matricula, <F1> para obtener ayuda o <ESC> para salir'
   @06,13 get wnumero pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>28
   if lastkey()<> 27
      @23,01 say 'Indique la categoria'
      @06,28 get wcatego pict '!!'
      read
      wxcat= 0
      do contrcat
      if wxcat = 0
      wkey=str(wnumero,5)+wcatego
      select 2
      use spmatri index spmatri.idx
      seek(wkey)
      if found()
         wqtitulo=titulo
         wkey1=str(dctipo,1)+str(dcnro,8)
         select 1
         use spprof index spprof.idx, spprofn
         seek(wkey1)
         if found()
            do panta01
            @06,31 say nombre
            do case
               case b.condic='1'
                    westado= 'Activo'
               case b.condic='2'
                    westado='Carnet Dep.'
               case b.condic='3'
                    westado= 'Fallecido'
               case b.condic='4'
                    westado= 'Suspendido'
               case b.condic='5'
               	    westado= 'Baja de Matr¡cula'
               case b.condic='6'
                    westado= 'Comunica Inactividad'	         
               case b.condic=' '
                    westado= '                 '
            endcase
            @22,02 say 'Estado      : '
            @22,18 say b.condic
            @22,21 say westado            
*  se relaciona matri con titu para poner descrip.del titulo
             select 3
             use sptitu order titulo
             select 2
             set relation to titulo into sptitu            
             wtitdesc=c.titdesc
             wotorga=b.otorga
             @08,17 say c.titulo
             @09,17 say c.titdesc
             @10,17 say b.otorga
             @14,19 say b.inscr
             @15,19 say b.fectit
             @16,19 say b.fechab
             @17,19 say b.pago
             @18,19 say b.habili
             @19,19 say b.vtohab
             @20,19 say b.feccert
             @16,42 say b.r92inic
             @17,42 say b.r92fact
             @18,42 say b.r92aut
             @19,42 say b.r92vto
             @16,55 say b.inacini
             @17,55 say b.inactua
             @18,55 say b.inacano
             @19,55 say b.inacvto
             if b.fectit <> {  /  /  }
                @21,19 say 'definitiva'
             else
                @21,19 say 'provisoria'
             endif
             wfecbh=b.habili
             select 3
             use spente order codigo
             seek(b.otorga)
             if found()
                wnoment=nombre
             else
                wnoment=space(15)
             endif
             @10,21 say wnoment 
             do spotti
             do buscresa
             wop=2
             do while wop<>1
                @23,25 get wop picture '@*H \<Salir;\<Modificar';
                       size 1,1 
                read
                @23,01 clear to 23,78
                if wop=2
                   do modifica1
                else
                endif         
                @23,01 clear to 23,78
             enddo       
         else
            @06,60 SAY 'SIN DATOS PERSONALES'
         endif      
      else
         *@06,60 say 'No encontro'
*         DO INGRESOS with wnumero, wcatego
      endif
      else
         @23, 01 say 'Mal codigo de categoria '
      endif   
   else
      wsigue='N'
   endif
   else
      save screen to wscr01
      do spay01
      restore screen from wscr01
   endif
   close all   
enddo
wop=2
@23,25 get wop pict '@*H \<Salir;\<Continuar ' size 1,1
read
@23,01 clear to 23,78
if wop=1
   contii='n'
else
   wsigue='S'   
endif
enddo
close all
@04,01 clear to 23,78
return


procedure modifica1
select 13
use modimatr
	append blank
	replace numero  with b.numero
	replace catego  with b.catego
	replace dctipo  with dctipo
	replace dcnro   with dcnro
	replace titulo  with b.titulo
	replace otorga  with b.otorga
	replace inscr   with b.inscr
	replace fectit  with b.fectit
	replace fechab  with b.fechab
	replace feccert with b.feccert
	replace pago    with b.pago
	replace recibo  with b.recibo
	replace habili  with b.habili
	replace afilia  with b.afilia
	replace condic  with b.condic
	replace vtohab  with b.vtohab
	replace modfecha with date()
	replace modcodm  with 1
	replace modoprdr with space(10)
	replace r92inic  with b.r92inic
	replace r92fact with b.r92fact
	replace r92aut   with b.r92aut
	replace r92vto   with b.r92vto
	replace inacini  with b.inacini
	replace inactua  with b.inactua
	replace inacano  with b.inacano
	replace inacvto  with b.inacvto
    
wnom=a.nombre
wtit=b.titulo
wfincr=b.inscr
wftit=b.fectit
wfhabil=b.fechab
wpago=b.pago
wfecb=b.habili
wfeccert=b.feccert
westcon=b.condic
wvtohab=b.vtohab
wr92ini=b.r92inic
wr92act=b.r92fact
wr92aut=b.r92aut
wr92vto=b.r92vto
winaini=b.inacini
winaact=b.inactua
winavto=b.inacvto
winaaut=b.inacano
wotorga=b.otorga
wnoment=space(25)
@23,01 clear to 23,78
@08,17 say wtit pict 'XXX'
@09,17 say wtitdesc
@10,16 say wotorga
@10,21 say wnoment
@16,42 say wr92ini
@17,42 say wr92act
@18,42 say wr92aut
@19,42 say wr92vto
@16,55 say winaini
@17,55 say winaact
@18,55 say winaaut
@19,55 say winavto
@16,42 get wr92ini
@17,42 get wr92act
@18,42 get wr92aut
@19,42 get wr92vto
@16,55 get winaini
@17,55 get winaact
@18,55 get winaaut
@19,55 get winavto
read
select 1
replace nombre  with wnom
select 2
replace b.titulo  with wtit
replace b.inscr   with wfincr
replace b.fectit  with wftit
replace b.fechab  with wfhabil
replace b.pago    with wpago
replace b.habili  with wfecb
replace b.feccert with wfeccert
replace b.otorga  with wotorga
replace b.vtohab  with wvtohab
replace b.r92inic with wr92ini
replace b.r92fact with wr92act
replace b.r92aut  with wr92aut
replace b.r92vto  with wr92vto
replace b.inacini with winaini
replace b.inactua with winaact
replace b.inacano with winaaut
replace b.inacvto with winavto
if westcon = '1' 
   westado= 'Activo '
   replace b.condic with '1'
else
   if westcon = '5'
      westado = 'Baja '
      replace b.condic with '5'
   else
      if westcon = '2'
         westado = 'Comunic.Inactiv. '
         replace b.condic with '6'
      else
         if westcon='3'
            westado = 'Fallecido '
            replace b.condic with '3'
         else
            if westcon='4'
               westado= 'Suspendido'
               replace b.condic with '4'
            else
               if westcon='6'
                  westado='Comunica Inactividad'
                  replace b.condic with '6'
               else   
                  if westcon=' '
                     westado='          '
                     replace b.condic with '1'
                  endif   
               endif      
            endif
         endif
      endif
   endif
endif
@22,21 say westado
select 13
use modimatr
	append blank
	replace numero  with b.numero
	replace catego  with b.catego
	replace dctipo  with dctipo
	replace dcnro   with dcnro
	replace titulo  with wtit
	replace otorga  with wotorga
	replace inscr   with wfincr
	replace fectit  with wftit
	replace fechab  with wfhabil
	replace feccert with wfeccert
	replace pago    with wpago
	replace recibo  with b.recibo
	replace habili  with wfecb
	replace afilia  with b.afilia
	replace condic  with b.condic
	replace vtohab  with wvtohab
	replace modfecha with date()
	replace modcodm  with 2
	replace modoprdr with space(10)
	replace r92inic  with b.r92inic
	replace r92fact with b.r92fact
	replace r92aut   with b.r92aut
	replace r92vto   with b.r92vto
	replace inacini  with b.inacini
	replace inactua  with b.inactua
	replace inacano  with b.inacano
	replace inacvto  with b.inacvto
select 2
@23,01 clear to 23,78
return


procedure contrcat
if wcatego = 'A '
	wxcat=0
else
   if wcatego = 'B1'
      wxcat=0
   else
      if wcatego = 'B2'
         wxcat = 0
      else
         if wcatego = 'C '
            wxcat = 0
         else
            if wcatego = 'D '
               wxcat = 0
            else
               if wcatego = 'E '
                  wxcat = 0
               else
                  if wcatego = 'CA'
                     wxcat = 0
                  else
                     if wcatego = 'CR'
                        wxcat = 0
                     else      
	                     if wcatego = 'CT'
    	                    wxcat = 0
        	             else      
            	            wxcat = 1
                	     endif   
                     endif   
                  endif   
               endif
            endif
         endif
      endif
   endif
endif                                 	
return

procedure spotti
wltiax=11
select 9
use sptiaux index sptiaux
locate for wkey = str(axnume,5)+axcate
do while found()
  @wltiax,14 say axtitu
  select 3
  use sptitu order titulo
  seek(i.axtitu)
  if found()
     @wltiax,17 say titdesc
  else
     @wltiax,17 say '                        '
  endif
  wltiax=wltiax+1
  select 9
  continue
enddo
return

procedure buscresa
wop99=0
@07,50 say '                    '
select 8
use sprestri index sprestri
locate for wkey=str(matric,5)+catego
do while found()
	if restrotr < 1
		wop99=1
	endif
	continue
		
	if wop99<>0
		@07,50 say 'Existe restriccion ' color r/w*
*		@24,78 get wop99 pict '9'
*		read 
	endif
enddo
use
return
	
procedure spotti1
@09,02 clear to 13,78
wltiax=11
select 9
use sptiaux index sptiaux
locate for wkey = str(axnume,5)+axcate
do while found()
  @wltiax,14 say axtitu
  select 3
  use sptitu order titulo
  seek(i.axtitu)
  if found()
     @wltiax,17 say titdesc
  endif   
     wxnume = wnumero
     wxcate = wcatego
     wxdcti= a.dctipo
     wxdcnro= a.dcnro
     wxtitu=space(3)
     wxotorga=space(4)
     wxfecti={  /  /  }
     wxfecce={  /  /  }
     WOPT1=1
     select 9
	 @23,01 clear to 23,78
	 @23,15 get wopt1 pict '@*H \<Contin£a;\<Elimina t¡tulo;\<Modifica' size 1,1
	 read
	 @23,01 clear to 23,78
	 if wopt1 = 1
	    wconti ='s'
	 else
	 	if wopt1 = 2
	 		delete
	 	else
	 		if wopt1 = 3
		      @23,01 say 'Ingrese codigo de titulo o <esc> para salir'
			   @14,50 clear to 14,59
			   select 3
			   use sptitu order titdesc
			   @23,01 say 'Seleccione un titulo y oprima <ESC> '
			   define window ptit from 13,30 to 20,63 title 'Titulos'
			   activate window ptit
			   brow fields titdesc nomodify in window ptit
			   deactivate window ptit
			   @23,01 clear to 23,78
			   wxtitu=titulo
			   wtitdesc=titdesc
      		  @wltiax,13 say wxtitu
      		  @wltiax,17 say wtitdesc
*     		  read
     		  @23,01 clear to 23,78
*     		  if lastkey()<>27
     		    @23,01 say 'Ingrese fecha del titulo  '
         		@wltiax,50 get wxfecti
         		read
         		@23,01 say 'Ingrese fecha certificado '
         		@wltiax,61 get wxfecce
         		read
				select 3
				use spente order codigo
				@23,01 say 'Seleccione una Entidad y oprima <ESC> '
				define window pent from 14,30 to 22,77 title 'Entidad Educativa'
				activate window pent
			    brow fields codigo, nombre, univer nomodify in window pent 
				deactivate window pent
				@23,01 clear to 23,78
			    wxotorga=codigo
				wnoment=nombre
				@08,17 say wtit pict 'XXX'
*         		@23,01 say 'Ingresa entidad otorgante '
         		@wltiax,72 say wxotorga pict 'XXXX'
         		@23,50 say wnoment
*         		wltiax=wltiax+1
*         		read
         		select 9
*         		append blank
         		replace axnume  with  wxnume
         		replace axcate  with  wxcate
         		replace axdcti  with  wxdcti
         		replace axdcnro with  wxdcnro
         		replace axtitu  with wxtitu
         		replace axfecti with wxfecti
         		replace axfecce with wxfecce
         		replace axotorg with wxotorga
*         	  endif	
	 		endif
	 	endif
	 endif   
*  else
*     @wltiax,21 say '                        '
*  endif
  wltiax=wltiax+1
  select 9
  continue
enddo
WOPT1=1
@23,01 clear to 23,78
@23,15 get wopt1 pict '@*H \<Salir;\<Ingresar' size 1,1
read
@23,01 clear to 23,78
if wopt1 = 2
   wconti ='s'
   do while wconti='s'
      wxnume = wnumero
      wxcate = wcatego
      wxdcti= a.dctipo
      wxdcnro= a.dcnro
      wxtitu=space(3)
      wxotorga=space(4)
      wxfecti={  /  /  }
      wxfecce={  /  /  }
      @23,01 say 'Ingrese codigo de titulo o <esc> para salir'
	   @14,50 clear to 14,59
	   select 3
	   use sptitu order titdesc
	   @23,01 say 'Seleccione un titulo y oprima <ESC> '
	   define window ptit from 13,20 to 20,78 title 'Titulos'
	   activate window ptit
	   brow fields titdesc nomodify in window ptit
	   deactivate window ptit
	   @23,01 clear to 23,78
	   wxtitu=titulo
	   wtitdesc=titdesc
      @wltiax,13 say wxtitu
      @wltiax,17 say wtitdesc
*      read
      @23,01 clear to 23,78
      wopsi='s'
*      if lastkey()<>27
         @wltiax,50 get wxfecti
         @23,01 say '     Ingrese fecha del t¡tulo '
         read
         @wltiax,61 get wxfecce
         @23,01 say '     Ingrese fecha del certificado '
         read
         @wltiax,72 get wxotorga pict 'XXXX'
         @23,01 say '     Ingrese entidad otorgante     '
				select 3
				use spente order codigo
				@23,01 say 'Seleccione una Entidad y oprima <ESC> '
				define window pent from 14,30 to 22,77 title 'Entidad Educativa'
				activate window pent
			    brow fields codigo, nombre, univer nomodify in window pent 
				deactivate window pent
				@23,01 clear to 23,78
			    wxotorga=codigo
				wnoment=nombre
*				@08,17 say wtit pict 'XXX'
*         		@23,01 say 'Ingresa entidad otorgante '
         		@wltiax,72 say wxotorga pict 'XXXX'
         		@23,15 say wnoment
         wltiax=wltiax+1
         read
         select 9
         append blank
         replace axnume  with  wxnume
         replace axcate  with  wxcate
         replace axdcti  with  wxdcti
         replace axdcnro with  wxdcnro
         replace axtitu  with wxtitu
         replace axfecti with wxfecti
         replace axfecce with wxfecce
         replace axotorg with wxotorga
         @23,01 say 'Continua? s/n '
         @23,65 get wopsi  pict 'X'
         read
         if wopsi='n' or wopsi='N'
	         wconti='n'
    	 endif
   enddo   
endif
return