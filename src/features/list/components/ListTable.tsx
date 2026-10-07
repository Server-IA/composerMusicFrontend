import MUIDataTable, {
  MUIDataTableColumnDef,
  MUIDataTableMeta,
  MUIDataTableOptions,
} from "mui-datatables";
import {
  Typography,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useListsContext } from "../context/List.context";
import { ILists } from "../models/List.type";
import { MUIDataTableDefaultOptions } from "@/constants/muidatatable.constants";
import { Download, Favorite, FavoriteBorder, PlayCircle } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useState } from "react";

// Type declaration for the `base64-js` package// Type declaration for the `base64-js` package
declare global {
  interface Base64 {
    atob(str: string): string;
  }
}
import * as base64 from "base64-js";
import { URL_API_BASE, URL_PLAYER } from "@/constants/url-apis.constants";
import * as Tone from "tone";
import { LoadingButton } from "@mui/lab";
import usePutList from "../hooks/usePutList";
import ToastsManager from "@/utilities/toasts.manager";

interface Props {
  Lists: ILists[];
  loading: boolean;
  getLists: () => Promise<void>;
  isFiltered?: boolean;
}

export default function ListsTable({ Lists, loading, getLists, isFiltered }: Props) {
  const { setListToEdit, openEditListDialog, setTitleListDialog, setIsEdit } =
    useListsContext();
  const { toogleFavorite } = usePutList();
  const [isPlaying, setIsPlaying] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [mid, setMid] = useState<string>(
    "TVRoZAAAAAYAAQACA8BNVHJrAAAACwD/UQMHJw4A/y8ATVRyawAAADgA/wMMU2FtcGxlIFRyYWNrAJAzf4dAgDN/AJAof4dAgCh/AJA1f4dAgDV/AJAQf4dAgBB/AP8vAA=="
  );
  const audioContext = new (window.AudioContext || window.AudioContext)();
  let audioBuffer: any = null;
  const audioSource = audioContext.createBufferSource();

  const playMidi = () => {
    if (audioBuffer) {
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioContext.destination);
      audioSource.start(0);
      setIsPlaying(true);
    }
  };

  const changeMidi = (midi: string) => {
    setMid(midi)
  }

  const stopMidi = () => {
    if (isPlaying) {
      audioSource.stop();
      setIsPlaying(false);
    }
  };

  const toggleFavoriteMelody = async (isFavorite: boolean, id: string) => {
    const isStateChange = await toogleFavorite(isFavorite, id);
    let message = 'Melodia removida de favoritas exitosamente.'
    if (isFavorite) {
      message = 'Melodia añadida a favoritas exitosamente'
    }
    ToastsManager.showToast('success', message);
    isFiltered
    if (getLists) {
      await getLists();
    }
    return isStateChange
  }

  const handleEditList = (Lists: ILists) => {
    setListToEdit(Lists);
  };
  const options: MUIDataTableOptions = {
    ...MUIDataTableDefaultOptions,
    searchPlaceholder: "Buscar melodias generadas",
  };
  const handleEditClick = (dataTable: MUIDataTableMeta<unknown>) => {
    setIsEdit(true);
    setTitleListDialog("Editar melodia");
    handleEditList(Lists[dataTable.rowIndex]);
    openEditListDialog();
  };

  const handleDownloadButton = (midi_data_url: string) => {
    const urlDownload = `${URL_API_BASE}/public/${midi_data_url}`;
    window.open(urlDownload);
  };

  const handlePlayButton = (midi_data_url: string) => {
    const urlAudio = `${URL_API_BASE}/public/${midi_data_url}.wav`;
    debugger;
    const player = new Tone.Player(urlAudio).toDestination();
    Tone.loaded().then(() => {
      player.start();
    });
  };

  const columns: MUIDataTableColumnDef[] = [
    { name: "id", options: { display: false } },
    {
      name: "uuid",
      label: " ",
      options: {
        customBodyRender: (uuid, dataTable) => {
          return (
            <Button
              onClick={() => {
                changeMidi(uuid);
                setOpen(true);
              }}
              endIcon={<PlayCircle />}
              variant="contained"
            >
              Play
            </Button>
          );
        },
      },
    },
    {
      name: "filename",
      label: "Código",
      options: {
        customBodyRender: (_, dataTable) => {
          return (
            <Typography>{`${dataTable.rowData[2].split("/")[0]}`}</Typography>
          );
        },
      },
    },
    {
      name: "filename",
      label: "Nombre",
      options: {
        customBodyRender: (_, dataTable) => {
          return (
            <Typography>{`${dataTable.rowData[2].split("/")[1]}`}</Typography>
          );
        },
      },
    },
    { name: "key", label: "Tonalidad" },
    {
      name: "midi_data",
      label: "Descargar",
      options: {
        customBodyRender: (midi_data, dataTable) => {
          return (
            <Button
              sx={{ cursor: "pointer" }}
              onClick={() => handleDownloadButton(dataTable.rowData[2])}
              endIcon={<Download />}
            >
              Descargar
            </Button>
          );
        },
      },
    },
    {
      name: "isFavorite",
      label: "Favorita",
      options: {
        customBodyRender: (isFavorite, dataTable) => {
          return (
            <Button
              sx={{ cursor: "pointer", width: 10 }}
              onClick={() => {
                toggleFavoriteMelody(!isFavorite, dataTable.rowData[2])
                Lists[dataTable.rowIndex].isFavorite = !isFavorite
              }}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </Button>
          );
        },
      },
    },
  ];

  return (
    <>
      <Dialog open={open} onClose={close} fullWidth maxWidth="md">
        <form noValidate onSubmit={() => { }}>
          <DialogTitle></DialogTitle>
          <DialogContent>
            <Grid
              container
              xs={12}
              sx={{
                textAlign: "center",
                marginTop: 3,
              }}
            >
              <iframe
                style={{ width: "100%" }}
                src={`${URL_PLAYER}/?mid=${mid}`}
              />
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="inherit"
              onClick={() => setOpen(false)}
            >
              Cerrar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <MUIDataTable
        title={
          loading ? (
            <Typography>
              Cargando... <CircularProgress size={20} />
            </Typography>
          ) : (
            "Lista de melodias"
          )
        }
        data={Lists}
        columns={columns}
        options={options}
      ></MUIDataTable>
    </>
  );
}
